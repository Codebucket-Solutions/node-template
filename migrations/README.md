# Migrations

This directory should start empty in a fresh template project except for this README.

Use:

```sh
npm run migration:new -- --name=<slug>
npm run migrate
```

Migration files should export:

```js
module.exports = {
	async up(queryInterface, sequelize) {},
	async down(queryInterface, sequelize) {},
};
```
