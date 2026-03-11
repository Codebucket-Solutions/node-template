module.exports = function (sequelize, DataTypes) {
	return sequelize.define(
		"assigner_rule",
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
			conditions_json: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			assignee_type: {
				type: DataTypes.ENUM("USER", "ROLE"),
				allowNull: false,
			},
			assignee_id: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			assignee_mode: {
				type: DataTypes.ENUM("STATIC", "CONTEXT"),
				allowNull: false,
				defaultValue: "STATIC",
			},
			assignee_resolver_key: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			assignee_resolver_params: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			priority: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 100,
			},
			is_active: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
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
			tableName: "assigner_rule",
			timestamps: false,
		},
	);
};
