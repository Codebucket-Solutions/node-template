const bcrypt = require("bcryptjs");

module.exports = {
	hashPassword: async password => {
		try {
			const saltRounds = 10;

			const hashedPassword = await new Promise((resolve, reject) => {
				bcrypt.hash(password, saltRounds, (err, hash) => {
					if (err) {
						return reject(err instanceof Error ? err : new Error(err));
					}
					resolve(hash);
				});
			});
			return hashedPassword;
		} catch (error) {
			console.log(error);
			return 0;
		}
	},
	compare: async (original, password) => {
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, original, (err, isMatch) => {
				if (err) {
					return reject(err instanceof Error ? err : new Error(err));
				} else {
					resolve(isMatch);
				}
			});
		});
	},
};
