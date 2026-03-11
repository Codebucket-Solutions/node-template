module.exports = function (sequelize, DataTypes) {
	return sequelize.define(
		"workflow_action",
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
			application_id: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			action: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			from_assignee_type: {
				type: DataTypes.ENUM("USER", "ROLE"),
				allowNull: true,
			},
			from_assignee_id: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			to_assignee_type: {
				type: DataTypes.ENUM("USER", "ROLE"),
				allowNull: true,
			},
			to_assignee_id: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			from_stage: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			to_stage: {
				type: DataTypes.STRING(100),
				allowNull: true,
			},
			remarks: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			metadata_json: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			actor_user_id: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			created_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			tableName: "workflow_action",
			timestamps: false,
		},
	);
};
