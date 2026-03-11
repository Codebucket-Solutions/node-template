const sequelize = require("../../../config/db");
const { ErrorHandler, statusCodes } = require("../../../helper");
const AssignmentService = require("./assignment");
const AssigneeResolver = require("./assignee-resolver");
const EscalationMatrix = require("./escalation-matrix");
const { getApplicationAdapter, getWorkflowModels, parseJson } = require("./workflow-support");

const { SERVER_ERROR, BAD_GATEWAY, UNAUTHORIZED } = statusCodes;

class Workflow {
	async timeline({ applicationType, applicationId, filterAssignedToMe = false }, user = null) {
		if (!applicationType || !applicationId) {
			throw new ErrorHandler(BAD_GATEWAY, "applicationType and applicationId are required");
		}

		try {
			const { WorkflowAction } = getWorkflowModels();
			if (filterAssignedToMe) {
				if (!user || user.isAuth !== true) {
					throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
				}

				const current = await new AssignmentService().getCurrent({
					applicationType,
					applicationId,
				});
				const isMine =
					current &&
					((current.assignee_type === "USER" &&
						String(current.assignee_id) === String(user.userId || "")) ||
						(current.assignee_type === "ROLE" &&
							String(current.assignee_id) === String(user.role || "")));
				if (!isMine) {
					throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
				}
			}

			return WorkflowAction.findAll({
				where: {
					application_type: String(applicationType).toUpperCase(),
					application_id: String(applicationId),
				},
				order: [["id", "ASC"]],
			});
		} catch (error) {
			console.error(error);
			if (error.statusCode) {
				throw error;
			}
			throw new ErrorHandler(SERVER_ERROR, error.message || error);
		}
	}

	async takeAction(
		{ applicationType, applicationId, action, remarks = null, context = {} },
		user = null,
		opts = {},
	) {
		if (!applicationType || !applicationId || !action) {
			throw new ErrorHandler(
				BAD_GATEWAY,
				"applicationType, applicationId and action are required",
			);
		}

		const exec = async transaction => {
			const adapter = await getApplicationAdapter(applicationType, transaction);
			const record = await adapter.model.findOne({
				where: { [adapter.idField]: String(applicationId) },
				transaction,
				lock: true,
			});
			if (!record) {
				throw new ErrorHandler(BAD_GATEWAY, `${applicationType} not found`);
			}

			const currentAssignment = await new AssignmentService().getCurrent(
				{ applicationType, applicationId },
				transaction,
			);
			if (!currentAssignment) {
				throw new ErrorHandler(BAD_GATEWAY, "No active assignment found");
			}

			if (!opts.bypassOwnershipCheck) {
				if (!user || user.isAuth !== true) {
					throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
				}

				const isMine =
					(currentAssignment.assignee_type === "USER" &&
						String(currentAssignment.assignee_id) === String(user.userId || "")) ||
					(currentAssignment.assignee_type === "ROLE" &&
						String(currentAssignment.assignee_id) === String(user.role || ""));
				if (!isMine) {
					throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
				}
			}

			const matrix = await new EscalationMatrix().resolve(
				{
					applicationType,
					currentStage: record[adapter.stageField],
					action,
					currentAssigneeType: currentAssignment.assignee_type,
					currentAssigneeId: currentAssignment.assignee_id,
				},
				transaction,
			);
			if (!matrix) {
				throw new ErrorHandler(
					BAD_GATEWAY,
					`No workflow transition configured for ${applicationType}/${action}`,
				);
			}

			const nextStage = matrix.next_stage ?? record[adapter.stageField];
			let assignmentId = record[adapter.currentAssignmentField];
			if (String(matrix.next_assignee_mode || "STATIC").toUpperCase() === "CONTEXT") {
				const resolved = await new AssigneeResolver().resolve(
					matrix.next_assignee_resolver_key
						? {
								resolverKey: matrix.next_assignee_resolver_key,
								params: parseJson(matrix.next_assignee_resolver_params),
								context,
							}
						: {
								resolver: parseJson(matrix.next_assignee_resolver_params),
								context,
							},
					transaction,
				);
				matrix.next_assignee_type = resolved.assigneeType;
				matrix.next_assignee_id = resolved.assigneeId;
			}

			if (matrix.next_assignee_type && matrix.next_assignee_id) {
				const assigned = await new AssignmentService().assign(
					{
						applicationType,
						applicationId,
						assigneeType: matrix.next_assignee_type,
						assigneeId: matrix.next_assignee_id,
						action,
						fromStage: record[adapter.stageField],
						toStage: nextStage,
						remarks,
					},
					user,
					transaction,
				);
				assignmentId = assigned.assignmentId;
			} else {
				await new AssignmentService().closeCurrent(
					{
						applicationType,
						applicationId,
						currentStage: record[adapter.stageField],
						toStage: nextStage,
						remarks,
					},
					user,
					transaction,
				);
				assignmentId = null;
			}

			record[adapter.stageField] = nextStage;
			record[adapter.currentAssignmentField] = assignmentId;
			await record.save({ transaction });

			return {
				applicationId: String(applicationId),
				action: String(action).toUpperCase(),
				nextStage,
				currentAssignmentId: assignmentId,
			};
		};

		try {
			if (opts.transaction) {
				return await exec(opts.transaction);
			}
			return await sequelize.transaction(exec);
		} catch (error) {
			console.error(error);
			if (error.statusCode) {
				throw error;
			}
			throw new ErrorHandler(SERVER_ERROR, error.message || error);
		}
	}
}

module.exports = Workflow;
