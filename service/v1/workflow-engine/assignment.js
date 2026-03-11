const sequelize = require("../../../config/db");
const { ErrorHandler, statusCodes } = require("../../../helper");
const AssigneeResolver = require("./assignee-resolver");
const { getWorkflowModels, matchesConditions, parseJson } = require("./workflow-support");

const { SERVER_ERROR, BAD_GATEWAY } = statusCodes;

class Assignment {
	async autoAssign(
		{ applicationType, applicationId, context = {} },
		user = null,
		existingTx = null,
	) {
		if (!applicationType || !applicationId) {
			throw new ErrorHandler(BAD_GATEWAY, "applicationType and applicationId are required");
		}

		const exec = async transaction => {
			const { AssignerRule } = getWorkflowModels();
			const rules = await AssignerRule.findAll({
				where: {
					application_type: String(applicationType).toUpperCase(),
					is_active: true,
				},
				order: [
					["priority", "ASC"],
					["id", "ASC"],
				],
				transaction,
			});

			const matched = rules.find(rule => matchesConditions(rule.conditions_json, context));
			if (!matched) {
				throw new ErrorHandler(
					BAD_GATEWAY,
					`No assigner rule configured for ${applicationType}`,
				);
			}

			let assigneeType = matched.assignee_type;
			let assigneeId = matched.assignee_id;
			if (String(matched.assignee_mode || "STATIC").toUpperCase() === "CONTEXT") {
				const resolved = await new AssigneeResolver().resolve(
					matched.assignee_resolver_key
						? {
								resolverKey: matched.assignee_resolver_key,
								params: parseJson(matched.assignee_resolver_params),
								context,
							}
						: {
								resolver: parseJson(matched.assignee_resolver_params),
								context,
							},
					transaction,
				);
				assigneeType = resolved.assigneeType;
				assigneeId = resolved.assigneeId;
			}

			return this.assign(
				{
					applicationType,
					applicationId,
					assigneeType,
					assigneeId,
					action: "AUTO_ASSIGNED",
					toStage: "ASSIGNED",
				},
				user,
				transaction,
			);
		};

		try {
			if (existingTx) {
				return await exec(existingTx);
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

	async assign(payload, user = null, existingTx = null) {
		const {
			applicationType,
			applicationId,
			assigneeType,
			assigneeId,
			action = "ASSIGNED",
			fromStage = null,
			toStage = null,
			remarks = null,
			metadata = null,
			logWorkflowAction = true,
		} = payload;

		if (!applicationType || !applicationId || !assigneeType || !assigneeId) {
			throw new ErrorHandler(
				BAD_GATEWAY,
				"applicationType, applicationId, assigneeType, assigneeId are required",
			);
		}

		const exec = async transaction => {
			const { Assignment: AssignmentModel, WorkflowAction } = getWorkflowModels();
			const currentRow = await AssignmentModel.findOne({
				where: {
					application_type: String(applicationType).toUpperCase(),
					application_id: String(applicationId),
					status: "ACTIVE",
				},
				order: [["id", "DESC"]],
				transaction,
				lock: true,
			});

			if (currentRow) {
				currentRow.status = "CLOSED";
				currentRow.closed_at = new Date();
				await currentRow.save({ transaction });
			}

			const created = await AssignmentModel.create(
				{
					application_type: String(applicationType).toUpperCase(),
					application_id: String(applicationId),
					assignee_type: String(assigneeType).toUpperCase(),
					assignee_id: String(assigneeId),
					assigned_by: user?.userId || null,
				},
				{ transaction },
			);

			if (logWorkflowAction) {
				await WorkflowAction.create(
					{
						application_type: String(applicationType).toUpperCase(),
						application_id: String(applicationId),
						action: String(action).toUpperCase(),
						from_assignee_type: currentRow?.assignee_type || null,
						from_assignee_id: currentRow?.assignee_id || null,
						to_assignee_type: String(assigneeType).toUpperCase(),
						to_assignee_id: String(assigneeId),
						from_stage: fromStage,
						to_stage: toStage,
						remarks,
						metadata_json: metadata,
						actor_user_id: user?.userId || null,
					},
					{ transaction },
				);
			}

			return { assignmentId: created.id };
		};

		try {
			if (existingTx) {
				return await exec(existingTx);
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

	async getCurrent({ applicationType, applicationId }, existingTx = null) {
		if (!applicationType || !applicationId) {
			throw new ErrorHandler(BAD_GATEWAY, "applicationType and applicationId are required");
		}

		try {
			const { Assignment: AssignmentModel } = getWorkflowModels();
			return await AssignmentModel.findOne({
				where: {
					application_type: String(applicationType).toUpperCase(),
					application_id: String(applicationId),
					status: "ACTIVE",
				},
				order: [["id", "DESC"]],
				transaction: existingTx || undefined,
			});
		} catch (error) {
			console.error(error);
			if (error.statusCode) {
				throw error;
			}
			throw new ErrorHandler(SERVER_ERROR, error.message || error);
		}
	}

	async closeCurrent(
		{ applicationType, applicationId, currentStage = null, toStage = null, remarks = null },
		user = null,
		existingTx = null,
	) {
		if (!applicationType || !applicationId) {
			throw new ErrorHandler(BAD_GATEWAY, "applicationType and applicationId are required");
		}

		const exec = async transaction => {
			const { Assignment: AssignmentModel, WorkflowAction } = getWorkflowModels();
			const row = await AssignmentModel.findOne({
				where: {
					application_type: String(applicationType).toUpperCase(),
					application_id: String(applicationId),
					status: "ACTIVE",
				},
				order: [["id", "DESC"]],
				transaction,
				lock: true,
			});

			if (!row) {
				return { closed: false };
			}

			row.status = "CLOSED";
			row.closed_at = new Date();
			await row.save({ transaction });

			await WorkflowAction.create(
				{
					application_type: String(applicationType).toUpperCase(),
					application_id: String(applicationId),
					action: "CLOSED",
					from_assignee_type: row.assignee_type,
					from_assignee_id: row.assignee_id,
					to_assignee_type: null,
					to_assignee_id: null,
					from_stage: currentStage,
					to_stage: toStage,
					remarks,
					actor_user_id: user?.userId || null,
				},
				{ transaction },
			);

			return { closed: true };
		};

		try {
			if (existingTx) {
				return await exec(existingTx);
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

module.exports = Assignment;
