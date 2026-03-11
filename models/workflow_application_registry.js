module.exports = function (sequelize, DataTypes) {
	return sequelize.define(
		"workflow_application_registry",
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
			model_name: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			id_field: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			stage_field: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			current_assignment_field: {
				type: DataTypes.STRING(100),
				allowNull: false,
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
			tableName: "workflow_application_registry",
			timestamps: false,
		},
	);
};
