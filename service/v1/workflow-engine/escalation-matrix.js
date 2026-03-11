const { ErrorHandler, statusCodes } = require("../../../helper");
const { getWorkflowModels } = require("./workflow-support");

const { SERVER_ERROR, BAD_GATEWAY } = statusCodes;

class EscalationMatrix {
	async resolve(
		{ applicationType, currentStage, action, currentAssigneeType, currentAssigneeId },
		existingTx = null,
	) {
		if (!applicationType || !currentStage || !action) {
			throw new ErrorHandler(
				BAD_GATEWAY,
				"applicationType, currentStage and action are required",
			);
		}

		try {
			const { WorkflowEscalationMatrix } = getWorkflowModels();
			const rows = await WorkflowEscalationMatrix.findAll({
				where: {
					application_type: String(applicationType).toUpperCase(),
					current_stage: currentStage,
					action: String(action).toUpperCase(),
					is_active: true,
				},
				order: [
					["priority", "ASC"],
					["id", "ASC"],
				],
				transaction: existingTx || undefined,
			});

			return (
				rows.find(row => {
					if (!row.current_assignee_type && !row.current_assignee_id) {
						return true;
					}
					return (
						String(row.current_assignee_type) === String(currentAssigneeType) &&
						String(row.current_assignee_id) === String(currentAssigneeId)
					);
				}) || null
			);
		} catch (error) {
			console.error(error);
			if (error.statusCode) {
				throw error;
			}
			throw new ErrorHandler(SERVER_ERROR, error.message || error);
		}
	}
}

module.exports = EscalationMatrix;
