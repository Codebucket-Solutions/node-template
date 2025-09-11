module.exports = function (plop) {
  // create your generators here

  // Validation for generatior that should that file or folder name should be in kabab-case
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

  const validateKebab = value => {
		if (kebabCaseRegex.test(value)) return true;
		return "File name must be in kebab-case (e.g., user-profile, auth-service).";
	};

  plop.setGenerator("route", {
    description: "application route logic",
    prompts: [
      {
        type: "input",
        name: "version",
        message: "Please enter version name",
        validate: validateKebab,
      },
      {
        type: "input",
        name: "group",
        message: "Please enter group name",
        validate: validateKebab,
      },
      {
        type: "input",
        name: "name",
        message: "Please enter route name",
        validate: validateKebab,
      },
    ],
    actions: [
      {
        type: "add",
        path: "routes/{{version}}/{{group}}/{{name}}.js",
        templateFile: "plop-templates/route.hbs",
      },
    ],
  });

  plop.setGenerator("controller", {
    description: "application controller logic",
    prompts: [
      {
        type: "input",
        name: "version",
        message: "Please enter version name",
        validate: validateKebab,
      },
      {
        type: "input",
        name: "group",
        message: "Please enter group name",
        validate: validateKebab,
      },
      {
        type: "input",
        name: "name",
        message: "Please enter controller name",
        validate: validateKebab,
      },
    ],
    actions: [
      {
        type: "add",
        path: "controllers/{{version}}/{{group}}/{{name}}.js",
        templateFile: "plop-templates/controller.hbs",
      },
    ],
  });

  plop.setGenerator("service", {
    description: "application service logic",
    prompts: [
      {
        type: "input",
        name: "version",
        message: "Please enter version name",
        validate: validateKebab,
      },
      {
        type: "input",
        name: "name",
        message: "Please enter file name",
        validate: validateKebab,
      },
      {
        type: "input",
        name: "serviceName",
        message: "Please enter service name",
        validate: validateKebab,
      },
    ],
    actions: [
      {
        type: "add",
        path: "service/{{version}}/{{name}}.js",
        templateFile: "plop-templates/service.hbs",
      },
    ],
  });
};
