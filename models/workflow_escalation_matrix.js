module.exports = function (sequelize, DataTypes) {
	return sequelize.define(
		"workflow_escalation_matrix",
		{
			id: {
				autoIncrement: true,
				type: DataTypes.BIGINT.UNSIGNED,
				allowNull: false,
				primaryKey: true,
			},
			application_type: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			current_stage: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			current_assignee_type: {
				type: DataTypes.ENUM("USER", "ROLE"),
				allowNull: true,
			},
			current_assignee_id: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			action: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			next_stage: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			next_assignee_type: {
				type: DataTypes.ENUM("USER", "ROLE"),
				allowNull: true,
			},
			next_assignee_id: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			next_assignee_mode: {
				type: DataTypes.ENUM("STATIC", "CONTEXT"),
				allowNull: false,
				defaultValue: "STATIC",
			},
			next_assignee_resolver_key: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			next_assignee_resolver_params: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			is_active: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			priority: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 100,
			},
			auto_trigger: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			auto_after_minutes: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			tableName: "workflow_escalation_matrix",
			timestamps: false,
		},
	);
};
