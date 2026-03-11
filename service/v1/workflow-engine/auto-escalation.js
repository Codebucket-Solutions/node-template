const sequelize = require("../../../config/db");
const { ErrorHandler, statusCodes } = require("../../../helper");
const AssignmentService = require("./assignment");
const Workflow = require("./workflow");
const EscalationMatrix = require("./escalation-matrix");
const { getApplicationAdapter, getWorkflowModels } = require("./workflow-support");

const { SERVER_ERROR, BAD_GATEWAY } = statusCodes;

class AutoEscalationService {
	async run(opts = {}) {
		if (!opts.applicationType) {
			throw new ErrorHandler(BAD_GATEWAY, "applicationType is required");
		}

		const applicationType = String(opts.applicationType).toUpperCase();
		const action = String(opts.action || "ESCALATE").toUpperCase();
		const batchSize = Number.isFinite(opts.batchSize) ? Number(opts.batchSize) : 25;

		try {
			const candidates = await this.#findCandidates({ applicationType, action, batchSize });
			let escalated = 0;
			let skipped = 0;
			const errors = [];

			for (const candidate of candidates) {
				try {
					const ok = await this.#processOne({
						applicationType,
						applicationId: candidate.applicationId,
						assignmentId: candidate.assignmentId,
						action,
					});
					if (ok) {
						escalated++;
					} else {
						skipped++;
					}
				} catch (error) {
					errors.push({
						applicationId: candidate.applicationId,
						message: error?.message || String(error),
					});
					console.error("auto-escalation error", error);
				}
			}

			return { scanned: candidates.length, escalated, skipped, errors };
		} catch (error) {
			console.error(error);
			if (error.statusCode) {
				throw error;
			}
			throw new ErrorHandler(SERVER_ERROR, error.message || error);
		}
	}

	async #findCandidates({ applicationType, action, batchSize }) {
		const adapter = await getApplicationAdapter(applicationType);

		const assignments = await getWorkflowModels().Assignment.findAll({
			where: {
				application_type: applicationType,
				status: "ACTIVE",
			},
			order: [["assigned_at", "ASC"]],
			limit: batchSize * 4,
		});

		const candidates = [];
		for (const assignment of assignments) {
			if (candidates.length >= batchSize) {
				break;
			}

			const record = await adapter.model.findOne({
				where: { [adapter.idField]: String(assignment.application_id) },
			});
			if (!record) {
				continue;
			}
			if (String(record[adapter.currentAssignmentField] || "") !== String(assignment.id)) {
				continue;
			}

			const matrix = await new EscalationMatrix().resolve({
				applicationType,
				currentStage: record[adapter.stageField],
				action,
				currentAssigneeType: assignment.assignee_type,
				currentAssigneeId: assignment.assignee_id,
			});
			if (!matrix?.auto_trigger || !matrix.auto_after_minutes) {
				continue;
			}

			const dueAt =
				new Date(assignment.assigned_at).getTime() +
				Number(matrix.auto_after_minutes) * 60 * 1000;
			if (Date.now() < dueAt) {
				continue;
			}

			candidates.push({
				applicationId: assignment.application_id,
				assignmentId: assignment.id,
				matrixId: matrix.id,
			});
		}

		return candidates;
	}

	async #processOne({ applicationType, applicationId, assignmentId, action }) {
		return sequelize.transaction(async transaction => {
			const current = await new AssignmentService().getCurrent(
				{ applicationType, applicationId },
				transaction,
			);
			if (!current || String(current.id) !== String(assignmentId)) {
				return false;
			}

			await new Workflow().takeAction(
				{
					applicationType,
					applicationId,
					action,
					remarks: "auto escalated",
				},
				{ isAuth: true, userId: null, role: null },
				{ bypassOwnershipCheck: true, transaction },
			);

			return true;
		});
	}
}

module.exports = AutoEscalationService;
