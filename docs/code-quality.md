# Code Quality - Linting and Formatting

## Overview

This project uses ESLint and Prettier to maintain consistent code quality and formatting across the codebase, regardless of the IDE or editor used (VSCode, WebStorm, Sublime, etc.).

## Tools

- **ESLint**: Code linting and quality checking
- **Prettier**: Code formatting
- **EditorConfig**: Base editor configuration
- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files

## Quick Start

### Install Extensions (Recommended)

**VSCode:**

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- EditorConfig (`editorconfig.editorconfig`)

**WebStorm/IntelliJ:**

- ESLint (built-in, enable in preferences)
- Prettier (built-in, enable in preferences)
- EditorConfig (built-in support)

---

## Configuration Files

### `eslint.config.js`

ESLint v9 flat configuration with:

- Node.js environment settings
- Prettier integration
- Code quality rules
- Ignores for `node_modules`, `dist`, etc.

### `.prettierrc`

Prettier formatting rules:

- Tab indentation (width: 4)
- 100 character line width
- Trailing commas
- Arrow parentheses avoidance

### `.editorconfig`

EditorConfig for basic editor settings:

- UTF-8 encoding
- LF line endings
- Tab indentation
- Trim trailing whitespace
- Insert final newline

### `.vscode/settings.json`

VSCode-specific settings:

- Auto-format on save
- ESLint auto-fix on save
- Prettier as default formatter

---

## npm Scripts

### Linting

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable linting errors
npm run lint:fix
```

### Formatting

```bash
# Format all files
npm run format

# Check if files are formatted correctly (CI)
npm run format:check
```

---

## Usage Examples

### Manual Linting

```bash
# Lint entire project
npm run lint

# Lint specific file
npx eslint path/to/file.js

# Lint and fix
npx eslint path/to/file.js --fix
```

### Manual Formatting

```bash
# Format entire project
npm run format

# Format specific file
npx prettier --write path/to/file.js

# Check formatting without modifying
npx prettier --check "**/*.js"
```

### IDE Integration

**VSCode:**

1. Install recommended extensions
2. Settings are already configured in `.vscode/settings.json`
3. Code will auto-format on save
4. ES Lint errors will show in Problems panel

**WebStorm:**

1. Enable ESLint: `Preferences → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint → Enable`
2. Enable Prettier: `Preferences → Languages & Frameworks → JavaScript → Prettier → Enable`
3. Enable "Run eslint --fix on save"
4. Enable "On save" for Prettier

---

## Pre-commit Hooks

Git hooks automatically run linting and formatting before each commit.

### What Happens on Commit:

1. **lint-staged** runs on staged files
2. **Prettier** formats all staged files (and auto-fixes formatting)
3. **ESLint** checks for code quality issues
4. If **ANY** linting error is found, the commit is **blocked** and errors are displayed
5. You must fix the errors manually and try committing again

### Configuration

**`.husky/pre-commit`**:

```bash
npx lint-staged
```

**`package.json` (`lint-staged` section)**:

```json
{
	"lint-staged": {
		"*.js": ["eslint", "prettier --write"],
		"*.{json,md,yml,yaml}": ["prettier --write"]
	}
}
```

### Bypassing Pre-commit (Emergency Only)

```bash
# Skip pre-commit hooks (NOT RECOMMENDED)
git commit --no-verify -m "Emergency commit"
```

---

## ESLint Rules

### Key Rules Enforced

| Rule | Description | Auto-fix |
| ---- | ----------- | -------- |

### Naming Conventions

| Type              | Convention   | Example                        |
| ----------------- | ------------ | ------------------------------ |
| **Files/Folders** | `kebab-case` | `user-controller.js`, `utils/` |

> **Note:** We strictly enforce `kebab-case` for all file and folder names.

---

| `no-console` | Allow console statements | N/A |
| `no-unused-vars` | Prevent unused variables (prefix with `_` to ignore) | ❌ |
| `prefer-const` | Use `const` for variables that are never reassigned | ✅ |
| `no-var` | Disallow `var`, use `let` or `const` | ✅ |
| `eqeqeq` | Require `===` and `!==` instead of `==` and `!=` | ❌ |
| `curly` | Require curly braces for all control statements | ✅ |
| `no-param-reassign` | Prevent reassigning function parameters | ❌ |
| `prefer-arrow-callback` | Prefer arrow functions for callbacks | ✅ |
| `prettier/prettier` | Enforce Prettier formatting | ✅ |

### Ignoring Rules

**Single line:**

```javascript
// eslint-disable-next-line no-console
console.log("This is allowed");
```

**Entire file:**

```javascript
/* eslint-disable no-console */
console.log("File-wide exception");
```

**Specific rule for function:**

```javascript
/* eslint-disable no-param-reassign */
function modifyParam(obj) {
	obj.modified = true;
}
/* eslint-enable no-param-reassign */
```

**Unused variables (prefix with underscore):**

```javascript
const { name, _unusedField } = user; // _unusedField won't trigger error
```

---

## Prettier Formatting

### Format Rules

- **Indentation**: Tabs (width: 4)
- **Line width**: 100 characters
- **Quotes**: Double quotes (auto)
- **Semicolons**: Automatic
- **Trailing commas**: Always
- **Arrow parens**: Avoid when possible

### Example

**Before:**

```javascript
function example(a, b, c) {
	const result = { name: "John", age: 30 };
	if (a == b) return result;
}
```

**After:**

```javascript
function example(a, b, c) {
\tconst result = { name: 'John', age: 30 };
\tif (a === b) {
\t\treturn result;
\t}
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
    lint:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: "20"
            - run: npm ci
            - run: npm run lint
            - run: npm run format:check
```

---

## Troubleshooting

### ESLint Not Working in IDE

**VSCode:**

1. Check ESLint extension is installed
2. Check "ESLint" appears in status bar
3. Reload window: `Cmd/Ctrl + Shift + P` → "Reload Window"
4. Check output: `View → Output → Select "ESLint"`

**WebStorm:**

1. `File → Invalidate Caches → Restart`
2. Verify ESLint is enabled in preferences
3. Check "ESLint" in bottom status bar shows green checkmark

### Format on Save Not Working

**VSCode:**

1. Verify `.vscode/settings.json` exists
2. Check `editor.formatOnSave` is `true`
3. Ensure Prettier extension is installed
4. Check file is in workspace (not just opened externally)

**WebStorm:**

1. Enable "Actions on Save" in preferences
2. Check "Reformat code" is enabled
3. Verify Prettier is set as default formatter

### Pre-commit Hook Not Running

```bash
# Reinstall husky
rm -rf .husky
npm run prepare

# Make hook executable
chmod +x .husky/pre-commit

# Test manually
.husky/pre-commit
```

### ESLint Errors Can't Be Auto-Fixed

Some errors require manual fixing:

1. **Unused variables** - Remove or prefix with `_`
2. **`==` vs `===`** - Change to strict equality
3. **Parameter reassignment** - Refactor code
4. **Undefined variables** - Import or define them

```bash
# See which errors can be auto-fixed
npm run lint -- --fix-dry-run
```

---

## Best Practices

✅ **Always run linting before committing** (automated via pre-commit)  
✅ **Fix linting errors, don't disable rules** unless absolutely necessary  
✅ **Use consistent formatting** across all files  
✅ **Review lint errors carefully** - they often catch real bugs  
✅ **Keep IDE extensions updated** for best compatibility  
✅ **Follow the configured style guide** (tabs, line width, etc.)  
✅ **Prefix unused parameters with `_`** to avoid errors  
✅ **Use strict equality** (`===`) instead of loose (`==`)

---

## Configuration Reference

### File Structure

```
.
├── eslint.config.js        # ESLint configuration (v9 flat config)
├── .prettierrc             # Prettier formatting rules
├── .editorconfig           # Base editor settings
├── .vscode/
│   ├── settings.json       # VSCode project settings
│   └── extensions.json     # Recommended extensions
├── .husky/
│   └── pre-commit          # Pre-commit hook script
└── package.json
    └── lint-staged         # Staged files configuration
```

### Environment Variables

None required - all configuration is file-based.

---

## Migration Guide

### From ESLint < 9

ESLint v9 uses flat config (`eslint.config.js`) instead of `.eslintrc.*`:

- ✅ Configuration is JavaScript (more flexible)
- ✅ Single config file (no cascading)
- ✅ Better performance
- ✅ Ignores defined in config (no `.eslintignore` needed)

### Adding to Existing Project

1. Install dependencies:

    ```bash
    npm install --save-dev eslint eslint-config-prettier eslint-plugin-prettier husky lint-staged
    ```

2. Copy configuration files:
    - `eslint.config.js`
    - `.prettierrc`
    - `.editorconfig`
    - `.vscode/` directory

3. Initialize git hooks:

    ```bash
    npm run prepare
    ```

4. Fix existing code:
    ```bash
    npm run lint:fix
    npm run format
    ```

---

## Customization

### Adding Custom ESLint Rules

Edit `eslint.config.js`:

```javascript
rules: {
  // Add your custom rules
  'no-console': 'warn', // Change to warning instead of off
  'max-len': ['error', { code: 120 }], // Increase max line length
}
```

### Changing Prettier Formatting

Edit `.prettierrc`:

```json
{
	"tabWidth": 2, // Change to 2 spaces
	"useTabs": false, // Use spaces instead of tabs
	"printWidth": 120 // Increase line width
}
```

---

For questions or issues, contact: **team@thecodebucket.com**
