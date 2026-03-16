const path = require("node:path");
const eslintPluginPrettier = require("eslint-plugin-prettier");
const eslintConfigPrettier = require("eslint-config-prettier");

const kebabCaseFilenamesPlugin = {
	rules: {
		"naming-convention": {
			meta: {
				type: "suggestion",
				docs: {
					description: "enforce kebab-case JavaScript filenames",
				},
				schema: [],
			},
			create(context) {
				return {
					Program(node) {
						const filename = context.filename;

						if (!filename || filename === "<input>") {
							return;
						}

						const extension = path.extname(filename);
						const basename = path.basename(filename, extension);
						const normalizedBasename = basename.replace(/\.(test|spec)$/, "");
						const isKebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedBasename);

						if (!isKebabCase) {
							context.report({
								node,
								message: "Filename '{{name}}' should be kebab-case.",
								data: {
									name: normalizedBasename,
								},
							});
						}
					},
				};
			},
		},
	},
};

module.exports = [
	{
		ignores: [
			"node_modules/**",
			"coverage/**",
			"dist/**",
			"build/**",
			"**/*.min.js",
			".husky/**",
			"models/*.js",
			"!models/init-models.js",
			"!models/models.js",
			"middleware/validator.js",
			"utils/time.js",
		],
	},
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "commonjs",
			globals: {
				console: "readonly",
				process: "readonly",
				__dirname: "readonly",
				__filename: "readonly",
				module: "readonly",
				require: "readonly",
				exports: "writable",
				Buffer: "readonly",
				setTimeout: "readonly",
				setInterval: "readonly",
				clearTimeout: "readonly",
				clearInterval: "readonly",
			},
		},
		plugins: {
			"prettier": eslintPluginPrettier,
			"filenames-simple": kebabCaseFilenamesPlugin,
		},
		rules: {
			...eslintConfigPrettier.rules,
			"prettier/prettier": "error",
			"no-console": "off",
			"no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"no-process-exit": "off",
			"prefer-const": "error",
			"no-var": "error",
			"object-shorthand": "error",
			"quote-props": ["error", "consistent"],
			"prefer-template": "error",
			"prefer-arrow-callback": "error",
			"no-param-reassign": [
				"error",
				{
					props: false,
				},
			],
			"no-unreachable": "error",
			"no-undef": "error",
			"eqeqeq": ["error", "always"],
			"curly": ["error", "all"],
			"brace-style": ["error", "1tbs"],

			// Naming Conventions
			"filenames-simple/naming-convention": "error",
			"semi": ["error", "always"],
		},
	},
	{
		files: ["eslint.config.js"],
		rules: {
			"filenames-simple/naming-convention": "off",
		},
	},
	{
		files: ["test/**/*.js"],
		languageOptions: {
			globals: {
				describe: "readonly",
				it: "readonly",
				before: "readonly",
				after: "readonly",
				beforeEach: "readonly",
				afterEach: "readonly",
			},
		},
	},
];
