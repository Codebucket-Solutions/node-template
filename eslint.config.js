const eslintPluginPrettier = require("eslint-plugin-prettier");
const eslintConfigPrettier = require("eslint-config-prettier");
const filenamesSimple = require("eslint-plugin-filenames-simple");

module.exports = [
	{
		ignores: [
			"node_modules/**",
			"coverage/**",
			"dist/**",
			"build/**",
			"**/*.min.js",
			".husky/**",
			"models/**",
			"middleware/validator.js",
			"middleware/dispatcher.js",
			"eslint.config.js",
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
			"filenames-simple": filenamesSimple,
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
			"quote-props": ["error", "as-needed"],
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
			"filenames-simple/naming-convention": ["error", { rule: "kebab-case" }],
			"semi": ["error", "always"],
		},
	},
];
