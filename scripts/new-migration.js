const fs = require("fs");
const path = require("path");

function getArg(name) {
	const prefix = `--${name}=`;
	const arg = process.argv.find(item => item.startsWith(prefix));
	return arg ? arg.slice(prefix.length) : "";
}

function slugify(value) {
	return String(value || "")
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function createTimestamp() {
	const now = new Date();
	const parts = [
		now.getUTCFullYear(),
		String(now.getUTCMonth() + 1).padStart(2, "0"),
		String(now.getUTCDate()).padStart(2, "0"),
		String(now.getUTCHours()).padStart(2, "0"),
		String(now.getUTCMinutes()).padStart(2, "0"),
		String(now.getUTCSeconds()).padStart(2, "0"),
	];

	return parts.join("");
}

const rawName = getArg("name");
const slug = slugify(rawName);

if (!slug) {
	console.error('Usage: npm run migration:new -- --name="create-users-table"');
	process.exit(1);
}

const migrationsDir = path.join(process.cwd(), "migrations");
fs.mkdirSync(migrationsDir, { recursive: true });

const filename = `${createTimestamp()}-${slug}.js`;
const target = path.join(migrationsDir, filename);

if (fs.existsSync(target)) {
	console.error(`Migration already exists: ${target}`);
	process.exit(1);
}

const content = `"use strict";

module.exports = {
\tasync up(_queryInterface, _sequelize) {
\t\t// TODO: implement ${slug} migration.
\t},

\tasync down(_queryInterface, _sequelize) {
\t\t// TODO: revert ${slug} migration.
\t},
};
`;

fs.writeFileSync(target, content);
console.log(`Created ${path.relative(process.cwd(), target)}`);
