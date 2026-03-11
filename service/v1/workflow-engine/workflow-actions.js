const { ErrorHandler, statusCodes } = require("../../../helper");
const AssignmentService = require("./assignment");
const { getApplicationAdapter, getWorkflowModels, parseJson } = require("./workflow-support");

const { SERVER_ERROR, BAD_GATEWAY, UNAUTHORIZED } = statusCodes;

class WorkflowActions {
	async allowedActions({ applicationType, applicationId }, user) {
		if (!applicationType || !applicationId) {
			throw new ErrorHandler(BAD_GATEWAY, "applicationType and applicationId are required");
		}
		if (!user || user.isAuth !== true) {
			throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
		}

		try {
			const adapter = await getApplicationAdapter(applicationType);
			const record = await adapter.model.findOne({
				where: { [adapter.idField]: String(applicationId) },
			});
			if (!record?.[adapter.stageField]) {
				return [];
			}

			const current = await new AssignmentService().getCurrent({
				applicationType,
				applicationId,
			});
			if (!current) {
				return [];
			}

			const isMine =
				(current.assignee_type === "USER" &&
					String(current.assignee_id) === String(user.userId || "")) ||
				(current.assignee_type === "ROLE" &&
					String(current.assignee_id) === String(user.role || ""));
			if (!isMine) {
				throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
			}

			const { WorkflowEscalationMatrix } = getWorkflowModels();
			const rows = await WorkflowEscalationMatrix.findAll({
				where: {
					application_type: String(applicationType).toUpperCase(),
					current_stage: record[adapter.stageField],
					is_active: true,
				},
				order: [
					["priority", "ASC"],
					["id", "ASC"],
				],
			});

			const seen = new Set();
			return rows
				.filter(row => {
					const assigneeMatch =
						(!row.current_assignee_type && !row.current_assignee_id) ||
						(String(row.current_assignee_type) === String(current.assignee_type) &&
							String(row.current_assignee_id) === String(current.assignee_id));
					if (!assigneeMatch || seen.has(row.action)) {
						return false;
					}
					seen.add(row.action);
					return true;
				})
				.map(row => ({
					action: row.action,
					next_stage: row.next_stage,
					next_assignee_type: row.next_assignee_type,
					next_assignee_id: row.next_assignee_id,
					next_assignee_mode: row.next_assignee_mode,
					next_assignee_resolver_key: row.next_assignee_resolver_key,
					next_assignee_resolver_params: row.next_assignee_resolver_params,
					nextAssigneeResolver: row.next_assignee_resolver_key
						? {
								resolverKey: row.next_assignee_resolver_key,
								params: parseJson(row.next_assignee_resolver_params),
							}
						: parseJson(row.next_assignee_resolver_params),
				}));
		} catch (error) {
			console.error(error);
			if (error.statusCode) {
				throw error;
			}
			throw new ErrorHandler(SERVER_ERROR, error.message || error);
		}
	}
}

module.exports = WorkflowActions;
