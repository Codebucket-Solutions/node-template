const { statusCodes, ErrorHandler, getCasbinEnforcer } = require("../helper");
const { constant, camelize } = require("../utils");

const { OK, UNAUTHORIZED } = statusCodes;
const { SUCCESS } = constant;

/**
 *
 * The dispacter function middleware is the single source for sending the response. This middleware
 * checks if the user is authenticated and if the allowed user has access to the controller.
 *
 * @param {*} req -> Express request object
 * @param {*} res -> Express response object
 * @param {*} next -> Express middleware next function
 * @param {*} func -> Router controller function
 * @param resource -> Resource to Check Permission On
 * @param {*} perm -> Permission to Check
 * @returns -> The final response with the data
 */

const dispatcher = async (req, res, next, func, resource, perm) => {
	try {
		const { user, body } = req;

		const enforcer = await getCasbinEnforcer();
		if (perm) {
			const checkPerm = await enforcer.enforce(
				String(user.userId),
				body.programCode,
				perm,
				user.role,
			);

			if (!checkPerm) {
				throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
			}
		} else if (body.programCode) {
			const permissions = await enforcer.getImplicitPermissionsForUser(`${user.userId}`);
			const hasAccess = permissions.some(([_sub, obj, _act]) => obj === body.programCode);

			if (user.role !== "Admin" && !hasAccess) {
				throw new ErrorHandler(UNAUTHORIZED, "Unauthorized");
			}
		}
		const data = await func(req, res, next);
		if (data !== null) {
			if (req.body && req.body.export) {
				if (data.data) {
					return res.xls(
						req.body.fileName ? req.body.fileName : "report.xlsx",
						data.data,
					);
				} else {
					return res.xls(req.body.fileName ? req.body.fileName : "report.xlsx", data);
				}
			}
			return res.status(OK).json({ status: SUCCESS, data: camelize(data) });
		}
	} catch (err) {
		next(err);
	}
};

module.exports = dispatcher;
