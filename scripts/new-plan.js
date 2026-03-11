const fs = require("fs");
const path = require("path");

function getArg(name) {
	const prefix = `--${name}=`;
	const arg = process.argv.find(item => item.startsWith(prefix));
	return arg ? arg.slice(prefix.length) : "";
}

const slug = getArg("slug").trim();
const title = getArg("title").trim();

if (!slug || !title) {
	console.error('Usage: npm run plan:new -- --slug=my-task --title="My Task"');
	process.exit(1);
}

const target = path.join(process.cwd(), "docs", "exec-plans", "active", `${slug}.md`);
if (fs.existsSync(target)) {
	console.error(`Plan already exists: ${target}`);
	process.exit(1);
}

const content = `# Execution Plan: ${slug}

- Status: active
- Owner: unassigned
- Scope: ${title}

## Goal
Describe the intended result.

## Acceptance criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Checklist
- [ ] Inspect existing implementation
- [ ] Implement smallest useful change
- [ ] Update docs if needed
- [ ] Run verification

## Verification notes
- Pending
`;

fs.writeFileSync(target, content);
console.log(`Created ${path.relative(process.cwd(), target)}`);
