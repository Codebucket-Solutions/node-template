module.exports = function (sequelize, DataTypes) {
	return sequelize.define(
		"assignment",
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
			assignee_type: {
				type: DataTypes.ENUM("USER", "ROLE"),
				allowNull: false,
			},
			assignee_id: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			assigned_by: {
				type: DataTypes.STRING(50),
				allowNull: true,
			},
			assigned_at: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
			status: {
				type: DataTypes.ENUM("ACTIVE", "CLOSED"),
				allowNull: false,
				defaultValue: "ACTIVE",
			},
			closed_at: {
				type: DataTypes.DATE,
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
			tableName: "assignment",
			timestamps: false,
		},
	);
};
