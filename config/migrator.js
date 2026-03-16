const path = require("path");
const { Umzug, SequelizeStorage } = require("umzug");
const { sequelize, getModels } = require("../models/models");

getModels();

function createMigrator(logger = console) {
	return new Umzug({
		migrations: {
			glob: path.join(__dirname, "..", "migrations", "*.js"),
			resolve: ({ name, path: filePath, context }) => {
				const migrationModule = require(filePath);
				const migration = migrationModule.default || migrationModule;

				return {
					name,
					up: async () => migration.up(context, sequelize),
					down: async () => migration.down(context, sequelize),
				};
			},
		},
		context: sequelize.getQueryInterface(),
		storage: new SequelizeStorage({
			sequelize,
			modelName: "sequelize_meta",
		}),
		logger,
	});
}

async function migrator(options = {}) {
	const { logger = console, command = "up", sync = false, alter = false, to, step = 1 } = options;

	await sequelize.authenticate();
	logger.log("✅ Database connection established");

	if (sync) {
		logger.log(`🔄 Syncing database${alter ? " with alter" : ""}...`);
		await sequelize.sync(alter ? { alter: true } : undefined);
	}

	const runner = createMigrator(logger);

	switch (command) {
		case "up": {
			logger.log("🔄 Running migrations...");
			const executed = await runner.up(to ? { to } : undefined);
			logger.log("✅ Migrations complete");
			return { command, executed };
		}
		case "down": {
			logger.log("↩️ Reverting migrations...");
			const reverted = await runner.down(to ? { to } : { step });
			logger.log("✅ Migration rollback complete");
			return { command, reverted };
		}
		case "pending": {
			const pending = await runner.pending();
			return { command, pending };
		}
		case "executed": {
			const executed = await runner.executed();
			return { command, executed };
		}
		case "status": {
			const [pending, executed] = await Promise.all([runner.pending(), runner.executed()]);
			return { command, pending, executed };
		}
		default:
			throw new Error(`Unsupported migration command: ${command}`);
	}
}

module.exports = {
	createMigrator,
	migrator,
	sequelize,
};
