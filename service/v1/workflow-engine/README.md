# Workflow Engine

This folder contains a generic workflow and assignment engine built on Sequelize models.

The goal is simple:

- keep track of who currently owns a piece of work,
- record every workflow action in a timeline,
- decide what actions are allowed at each stage,
- move work to the next assignee or stage,
- and optionally auto-escalate overdue work.

This README explains the engine in plain language and in implementation detail.

## What Problem This Solves

Many business applications have records that move between people, roles, and stages.

Examples:

- a grievance moves from Head Office to Division to Depot,
- a ticket moves from support to engineering,
- an approval moves from maker to checker to approver.

Every such system usually needs the same things:

1. A way to know who currently owns the record.
2. A way to know what stage the record is currently in.
3. A way to record every transition for audit/history.
4. A rule book that says what action is allowed from which stage.
5. A way to assign the next owner.
6. A way to automatically escalate if nothing happens for some time.

This folder implements those generic building blocks.

## High-Level Idea

The engine does not own your business entity itself.

It only manages workflow behavior around that entity.

For example, if your business record is a ticket, complaint, grievance, approval, or task, that business table remains your application table. The workflow engine only needs to know:

- which Sequelize model represents that application type,
- which field is the record id,
- which field stores the current stage,
- which field stores the current assignment pointer.

Then the engine stores workflow metadata in separate generic tables:

- `workflow_application_registry`
- `assigner_rule`
- `assignment`
- `workflow_action`
- `workflow_escalation_matrix`

## Folder Contents

- `assignment.js`
  Handles creating assignments, closing current assignments, and auto-assignment.
- `assignee-resolver.js`
  Resolves dynamic assignees from rules and runtime context.
- `escalation-matrix.js`
  Resolves the correct workflow transition row for a stage/action pair.
- `workflow.js`
  Performs workflow transitions and returns the timeline.
- `workflow-actions.js`
  Computes what actions are allowed for the current assignee.
- `auto-escalation.js`
  Finds overdue assignments and triggers configured automatic transitions.
- `workflow-support.js`
  Shared helpers for model lookup, application adapters, JSON parsing, and rule matching.
- `index.js`
  Re-exports the engine services.

## Data Model

### 1. `assigner_rule`

Purpose:

- decides who should get a record when it is auto-assigned.

Important fields:

- `application_type`
  The kind of record, for example `TICKET`, `COMPLAINT`, `APPROVAL`, or `GRIEVANCE`.
- `conditions_json`
  Optional condition object. If present, the incoming context must match it.
- `assignee_type`
  Usually `USER` or `ROLE`.
- `assignee_id`
  The static id if the rule is direct.
- `assignee_mode`
  `STATIC` or `CONTEXT`.
- `assignee_resolver_key`
  Optional key column kept for compatibility with existing schemas. The current engine expects full resolver specs instead of hard-coded named keys.
- `assignee_resolver_params`
  Optional JSON payload used by the resolver.
- `priority`
  Lower number wins.
- `is_active`
  Whether the rule is active.

How it is used:

1. Find all active rules for the application type.
2. Sort by priority.
3. Pick the first rule whose `conditions_json` matches the runtime context.
4. If the rule is `STATIC`, use the assignee directly.
5. If the rule is `CONTEXT`, resolve the assignee dynamically.

### 2. `workflow_application_registry`

Purpose:

- tells the engine how to locate and update each application type in a table-driven way.

Important fields:

- `application_type`
- `model_name`
- `id_field`
- `stage_field`
- `current_assignment_field`
- `is_active`

How it is used:

1. The engine receives an `applicationType`.
2. It loads the matching active row from `workflow_application_registry`.
3. It finds the Sequelize model named in `model_name`.
4. It uses the configured field names to load and update the application record.

This is what makes the engine table-controlled instead of hard-coded for one business entity.

### 3. `assignment`

Purpose:

- stores current and past ownership of an application record.

Important fields:

- `application_type`
- `application_id`
- `assignee_type`
- `assignee_id`
- `assigned_by`
- `assigned_at`
- `status`
  `ACTIVE` or `CLOSED`
- `closed_at`

How it is used:

- there should be at most one active assignment for a given application record,
- when a new assignment is created, the old active one is closed,
- the application record points to the active assignment using `current_assignment_id`.

### 4. `workflow_action`

Purpose:

- stores the audit trail of workflow transitions.

Important fields:

- `application_type`
- `application_id`
- `action`
- `from_assignee_type`
- `from_assignee_id`
- `to_assignee_type`
- `to_assignee_id`
- `from_stage`
- `to_stage`
- `remarks`
- `metadata_json`
- `actor_user_id`

How it is used:

- every important transition writes one row here,
- this table powers the workflow timeline,
- this is your audit history.

### 5. `workflow_escalation_matrix`

Purpose:

- acts like the workflow rule book.

Important fields:

- `application_type`
- `current_stage`
- `current_assignee_type`
- `current_assignee_id`
- `action`
- `next_stage`
- `next_assignee_type`
- `next_assignee_id`
- `next_assignee_mode`
- `next_assignee_resolver_key`
- `next_assignee_resolver_params`
- `priority`
- `is_active`
- `auto_trigger`
- `auto_after_minutes`

How it is used:

- when a user performs an action, the engine looks here to decide what should happen next,
- if `current_assignee_type` and `current_assignee_id` are null, that row is a wildcard,
- otherwise the current assignee must match,
- lower priority wins,
- if `auto_trigger` is enabled, the row can also be used by the auto-escalation worker.

## Host Application Requirements

The engine is generic, but it still needs host models to exist in Sequelize.

For every application type you want to drive through the engine, you need:

1. A Sequelize model registered in the app.
2. A row in `workflow_application_registry` that tells the engine:
    - the application type name,
    - the Sequelize model name,
    - the id field,
    - the stage field,
    - the current assignment field.

Example registry row:

```json
{
	"application_type": "TICKET",
	"model_name": "ticket",
	"id_field": "ticket_id",
	"stage_field": "stage",
	"current_assignment_field": "current_assignment_id",
	"is_active": true
}
```

The assignee resolver is also generic now.

For `LOOKUP` mode, it needs:

1. A registered Sequelize model for the target table.
2. A resolver spec that says:
    - which table/model to read,
    - which fields to match,
    - which result field becomes the assignee id,
    - what assignee type should be returned.

If these host models are not registered in Sequelize, the engine fails fast with clear errors.

## Seeding Guide

The engine is generic, but it does not do anything until its control tables are seeded.

In practice, there are four things you seed:

1. `workflow_application_registry`
2. `assigner_rule`
3. `workflow_escalation_matrix`
4. optional application-side seed data such as users, roles, departments, queues, or lookup rows used by resolvers

The cleanest rollout order is:

1. Seed the host application model data your resolver depends on.
2. Seed `workflow_application_registry`.
3. Seed `assigner_rule`.
4. Seed `workflow_escalation_matrix`.
5. Create one application record and test:
   auto assignment, allowed actions, manual transition, and auto escalation.

### 1. Seed `workflow_application_registry`

This table tells the engine how to read and update a given application type.

Example:

```sql
INSERT INTO workflow_application_registry
	(application_type, model_name, id_field, stage_field, current_assignment_field, is_active)
VALUES
	('TICKET', 'ticket', 'ticket_id', 'stage', 'current_assignment_id', 1);
```

What this means:

- when the engine receives `applicationType = TICKET`,
- it will look for a Sequelize model named `ticket` or `Ticket`,
- it will read the record id from `ticket_id`,
- it will read and update the stage in `stage`,
- it will read and update the active assignment pointer in `current_assignment_id`.

Another example:

```sql
INSERT INTO workflow_application_registry
	(application_type, model_name, id_field, stage_field, current_assignment_field, is_active)
VALUES
	('COMPLAINT', 'complaint', 'complaint_id', 'status_stage', 'assignment_ref_id', 1);
```

That shows why this table exists:

- different business tables can use different field names,
- and the engine still works without code changes.

### 2. Seed `assigner_rule`

This table answers:

"When a new record should be assigned automatically, who gets it?"

There are two main styles.

#### Static assignment rule

Example:

```sql
INSERT INTO assigner_rule
	(application_type, conditions_json, assignee_type, assignee_id, assignee_mode, priority, is_active)
VALUES
	('TICKET', NULL, 'ROLE', 'LEVEL1_SUPPORT', 'STATIC', 10, 1);
```

What this means:

- every new `TICKET` with no more specific rule match goes to role `LEVEL1_SUPPORT`.

#### Context-driven assignment rule

Example:

```sql
INSERT INTO assigner_rule
	(
		application_type,
		conditions_json,
		assignee_type,
		assignee_id,
		assignee_mode,
		assignee_resolver_params,
		priority,
		is_active
	)
VALUES
	(
		'TICKET',
		JSON_OBJECT('category', 'NETWORK'),
		'USER',
		'0',
		'CONTEXT',
		JSON_OBJECT(
			'mode', 'LOOKUP',
			'table', 'user_directory',
			'assigneeType', 'USER',
			'assigneeIdField', 'id',
			'where', JSON_OBJECT(
				'status', 'Active',
				'department_id', JSON_OBJECT('valueFromContext', 'departmentId'),
				'location', JSON_OBJECT(
					'code', JSON_OBJECT('valueFromContext', 'locationCode')
				)
			)
		),
		1,
		1
	);
```

What this means:

- only apply this rule when `context.category === "NETWORK"`,
- look up a row from model/table `user_directory`,
- match:
    - `status = Active`
    - `department_id = context.departmentId`
    - `location.code = context.locationCode`
- return that row’s `id` as the assignee,
- because priority is `1`, this rule wins before the fallback static rule with priority `10`.

Important note:

- for `CONTEXT` mode, `assignee_type` and `assignee_id` are not the final assignee;
  they are effectively placeholders because the resolver computes the real target.

### 3. Seed `workflow_escalation_matrix`

This table answers:

"If the record is currently at stage X and the current assignee performs action Y, what happens next?"

#### Example: forward from triage to investigation

```sql
INSERT INTO workflow_escalation_matrix
	(
		application_type,
		current_stage,
		current_assignee_type,
		current_assignee_id,
		action,
		next_stage,
		next_assignee_type,
		next_assignee_id,
		next_assignee_mode,
		priority,
		is_active
	)
VALUES
	(
		'TICKET',
		'TRIAGE',
		NULL,
		NULL,
		'FORWARD',
		'INVESTIGATION',
		'ROLE',
		'LEVEL2_SUPPORT',
		'STATIC',
		10,
		1
	);
```

What this means:

- when a `TICKET` is in `TRIAGE`,
- and someone performs `FORWARD`,
- move the record to stage `INVESTIGATION`,
- assign it to role `LEVEL2_SUPPORT`,
- the current assignee does not matter because the current assignee columns are null.

#### Example: stage-specific contextual escalation

```sql
INSERT INTO workflow_escalation_matrix
	(
		application_type,
		current_stage,
		action,
		next_stage,
		next_assignee_type,
		next_assignee_id,
		next_assignee_mode,
		next_assignee_resolver_params,
		priority,
		is_active
	)
VALUES
	(
		'TICKET',
		'LEVEL2_REVIEW',
		'ESCALATE',
		'MANAGER_REVIEW',
		'USER',
		'0',
		'CONTEXT',
		JSON_OBJECT(
			'mode', 'LOOKUP',
			'table', 'user_directory',
			'assigneeType', 'USER',
			'assigneeIdField', 'id',
			'where', JSON_OBJECT(
				'status', 'Active',
				'role', 'MANAGER',
				'department_id', JSON_OBJECT('valueFromContext', 'departmentId')
			)
		),
		5,
		1
	);
```

What this means:

- from stage `LEVEL2_REVIEW`,
- action `ESCALATE` moves the record to `MANAGER_REVIEW`,
- the next assignee is not hard-coded,
- instead, the engine resolves a manager for the current `departmentId`.

### 4. Seed auto-escalation behavior

Auto escalation is not a separate engine.

It is just a timed use of the same `workflow_escalation_matrix`.

Example:

```sql
INSERT INTO workflow_escalation_matrix
	(
		application_type,
		current_stage,
		action,
		next_stage,
		next_assignee_type,
		next_assignee_id,
		next_assignee_mode,
		priority,
		is_active,
		auto_trigger,
		auto_after_minutes
	)
VALUES
	(
		'TICKET',
		'LEVEL1_PENDING',
		'ESCALATE',
		'LEVEL2_PENDING',
		'ROLE',
		'LEVEL2_SUPPORT',
		'STATIC',
		1,
		1,
		1,
		30
	);
```

What this means:

- if a `TICKET` stays assigned at stage `LEVEL1_PENDING`,
- and the active assignment has been open for 30 minutes,
- the auto escalation worker can perform `ESCALATE`,
- moving the record to `LEVEL2_PENDING`,
- and reassigning it to `LEVEL2_SUPPORT`.

### 5. Recommended first test seed

If you are wiring this engine for the first time, do not start with complex contextual rules.

Start with this minimal path:

1. one registry row,
2. one static assigner rule,
3. one simple matrix row for `FORWARD`,
4. one simple matrix row for `CLOSED` or terminal resolution,
5. one test application record.

Example minimal seed set:

```sql
INSERT INTO workflow_application_registry
	(application_type, model_name, id_field, stage_field, current_assignment_field, is_active)
VALUES
	('TICKET', 'ticket', 'ticket_id', 'stage', 'current_assignment_id', 1);

INSERT INTO assigner_rule
	(application_type, assignee_type, assignee_id, assignee_mode, priority, is_active)
VALUES
	('TICKET', 'ROLE', 'LEVEL1_SUPPORT', 'STATIC', 1, 1);

INSERT INTO workflow_escalation_matrix
	(
		application_type,
		current_stage,
		action,
		next_stage,
		next_assignee_type,
		next_assignee_id,
		next_assignee_mode,
		priority,
		is_active
	)
VALUES
	('TICKET', 'ASSIGNED', 'FORWARD', 'IN_PROGRESS', 'ROLE', 'LEVEL2_SUPPORT', 'STATIC', 1, 1),
	('TICKET', 'IN_PROGRESS', 'CLOSED', 'CLOSED', NULL, NULL, 'STATIC', 1, 1);
```

That gives you the smallest realistic end-to-end path:

- auto-assign to level 1,
- forward to level 2,
- close the record.

Once that works, add context resolvers and timed escalations.

## Service-by-Service Explanation

### `assignment.js`

This service handles ownership.

Main methods:

- `autoAssign(...)`
- `assign(...)`
- `getCurrent(...)`
- `closeCurrent(...)`

#### `autoAssign`

This method is for the first assignment or any rule-driven assignment.

What it does:

1. Validates that `applicationType` and `applicationId` exist.
2. Loads active `assigner_rule` rows for that type.
3. Matches the first rule whose `conditions_json` fits the supplied context.
4. Resolves the assignee:
   either direct from the rule or dynamically through `AssigneeResolver`.
5. Calls `assign(...)` to create the actual assignment row.
6. Writes a workflow action with action `AUTO_ASSIGNED`.

#### `assign`

This is the core ownership change method.

What it does:

1. Finds the current active assignment for the record.
2. Locks it inside a transaction.
3. Closes it if it exists.
4. Creates a new `assignment` row.
5. Writes a `workflow_action` row for audit.
6. Returns the new `assignmentId`.

This method is transaction-aware. If a parent transaction exists, it uses that transaction instead of creating a new one.

#### `getCurrent`

Returns the latest active assignment for a record.

#### `closeCurrent`

Closes the active assignment and writes a `CLOSED` workflow action entry.

### `assignee-resolver.js`

This service converts a rule into a real assignee.

Supported styles:

1. Static resolver
2. Lookup resolver

#### Static resolver

Example:

```json
{
	"mode": "STATIC",
	"assigneeType": "USER",
	"assigneeId": 50
}
```

This directly returns:

- `assigneeType = USER`
- `assigneeId = 50`

#### Lookup resolver

Example:

```json
{
	"mode": "LOOKUP",
	"table": "user_directory",
	"assigneeType": "USER",
	"assigneeIdField": "id",
	"where": {
		"status": "Active",
		"department_id": { "valueFromContext": "departmentId" },
		"location": {
			"code": { "valueFromContext": "locationCode" }
		}
	}
}
```

This means:

1. Look at the runtime context.
2. Read values such as `context.departmentId` and `context.locationCode`.
3. Query the configured Sequelize model using exact field filters where possible.
4. Perform structured object matching in application code for nested JSON-like values.
5. Return the configured assignee id field from the matched row.

That means lookup resolution is no longer tied to a specific `login` table or to specific pre-defined business keys.

### `escalation-matrix.js`

This service finds the correct workflow rule.

Input:

- `applicationType`
- `currentStage`
- `action`
- current assignee info

What it does:

1. Loads all active matrix rows matching application type, current stage, and action.
2. Sorts them by priority.
3. Returns the first row that matches the current assignee.
4. If a row has no current assignee constraint, it behaves like a wildcard.

This is the decision engine for transitions.

### `workflow.js`

This is the main orchestration service.

Main methods:

- `timeline(...)`
- `takeAction(...)`

#### `timeline`

Returns the ordered list of `workflow_action` rows for an application record.

Optional behavior:

- if `filterAssignedToMe` is true, it first confirms that the current active assignment belongs to the logged-in user or role.

#### `takeAction`

This is the heart of the workflow engine.

What it does:

1. Loads the application record through the adapter.
2. Loads the current active assignment.
3. Verifies ownership unless `bypassOwnershipCheck` is enabled.
4. Resolves the correct transition from `workflow_escalation_matrix`.
5. Determines the `nextStage`.
6. Determines the next assignee:
   direct values or dynamic resolver depending on matrix configuration.
7. If there is a next assignee:
   creates a new assignment and closes the old one.
8. If there is no next assignee:
   closes the current assignment.
9. Updates the application record:
   `stage` and `current_assignment_id`.
10. Returns a summary object.

This method is transaction-safe and is used both by normal user actions and auto escalation.

### `workflow-actions.js`

This service answers a UI question:

"What actions can the current assignee perform right now?"

What it does:

1. Loads the application record.
2. Loads the current active assignment.
3. Confirms that the record is assigned to the current user or role.
4. Loads all active matrix rows for the current stage.
5. Filters rows that match the current assignee.
6. Deduplicates by action.
7. Returns action metadata for the frontend or API consumer.

This is useful for:

- action buttons,
- permission-aware UI,
- workflow action APIs.

### `auto-escalation.js`

This service performs timed escalations.

What it does:

1. Reads active assignments.
2. Loads the related application record.
3. Ensures the assignment is still the current assignment.
4. Resolves the escalation matrix row for the record’s current stage.
5. Checks whether `auto_trigger = true`.
6. Checks whether `assigned_at + auto_after_minutes` is overdue.
7. If yes, runs `Workflow.takeAction(...)` with `bypassOwnershipCheck`.

This means auto escalation uses the exact same workflow engine as normal user actions. That is important because it keeps behavior consistent.

## End-to-End Flow

Here is a typical lifecycle.

### Case 1: Auto assignment

1. An application record is created.
2. Application code calls `Assignment.autoAssign(...)`.
3. The engine loads `assigner_rule`.
4. It matches a rule using the runtime context.
5. It resolves the assignee.
6. It creates an active `assignment`.
7. It writes a `workflow_action` row with `AUTO_ASSIGNED`.
8. The application record can then set `current_assignment_id`.

### Case 2: Manual action by current assignee

1. Current assignee clicks `ESCALATE`.
2. Application code calls `Workflow.takeAction(...)`.
3. The engine verifies that the record is really assigned to that user or role.
4. It finds the correct transition row in `workflow_escalation_matrix`.
5. It resolves the next assignee if needed.
6. It closes the old assignment.
7. It creates the new assignment.
8. It writes a `workflow_action` row.
9. It updates the business record’s stage and `current_assignment_id`.

### Case 3: Automatic escalation

1. A scheduler calls `AutoEscalationService.run()`.
2. It scans active assignments.
3. It filters to overdue records only.
4. It re-checks current ownership in a transaction.
5. It calls `Workflow.takeAction(...)` with system context.
6. The record moves exactly as if a user had performed the action.

## Why This Design Uses Sequelize Models Instead of Raw SQL

The referenced BSRTC implementation used direct queries.

This implementation intentionally does not.

Reasons:

- keeps the engine aligned with this template’s Sequelize-based structure,
- makes transactions and row updates easier to follow,
- allows the host application to register models once and reuse them everywhere,
- reduces SQL duplication in service code,
- makes dynamic app integration cleaner through `sequelize.models`.

There is still one important tradeoff:

- structured JSON-like matching for generic lookup resolvers is done in JavaScript after Sequelize fetches rows using ordinary filters.

That keeps the engine database-agnostic at the service layer, but it may be less efficient than database-native JSON operators for very large datasets.

## Transaction Behavior

Most write methods support either:

- using an existing transaction passed by the caller,
- or creating their own transaction if none is provided.

This matters because a full workflow action often needs to update multiple things together:

- assignment rows,
- workflow audit row,
- application record stage,
- current assignment pointer.

If any one of those steps fails, the whole change should roll back.

## Error Handling Style

The engine uses `ErrorHandler` and existing `statusCodes` from the repo.

It fails early for common problems such as:

- missing application type,
- missing application id,
- unsupported application type,
- missing host models,
- no active assignment,
- no matching assigner rule,
- no matching escalation matrix row,
- unauthorized action attempts.

## Current Limitations

At the moment the engine is intentionally generic but not unlimited.

Known constraints:

- host applications must populate `workflow_application_registry` correctly,
- assignment matching logic for `conditions_json` is exact-match only,
- structured lookup matching is resolved in application code, not with DB JSON operators,
- auto escalation expects the application model to expose the current assignment pointer.

These are acceptable constraints for a first generic engine and are easy to extend in one place.

## How To Extend It

### Add another application type

1. Register the Sequelize model in the host app.
2. Insert a row into `workflow_application_registry`.
3. Start using that `application_type` in rules and matrix rows.

No engine code change is required for that step.

### Add a new resolver type

Edit `assignee-resolver.js`.

Options:

- add another `mode`,
- add richer matching operators,
- or add database-native matching for a specific provider if needed.

### Add richer condition matching

Edit `matchesConditions(...)` in `workflow-support.js`.

Right now it only checks exact equality for keys in `conditions_json`.

You could extend it for:

- array inclusion,
- range matching,
- nested keys,
- custom predicates.

## Minimal Usage Example

### Export access

```js
const { workflowEngine } = require("../../service/v1");
```

### Auto assign a record

```js
await new workflowEngine.Assignment().autoAssign({
	applicationType: "TICKET",
	applicationId: ticketId,
	context: {
		departmentId: 12,
		locationCode: "PATNA",
	},
});
```

### Get allowed actions for current user

```js
const actions = await new workflowEngine.WorkflowActions().allowedActions(
	{
		applicationType: "TICKET",
		applicationId: ticketId,
	},
	req.user,
);
```

### Perform a workflow action

```js
await new workflowEngine.Workflow().takeAction(
	{
		applicationType: "TICKET",
		applicationId: ticketId,
		action: "ESCALATE",
		remarks: "Escalating to next level",
		context: {
			departmentId: 12,
			locationCode: "PATNA",
		},
	},
	req.user,
);
```

### Get the timeline

```js
const timeline = await new workflowEngine.Workflow().timeline({
	applicationType: "TICKET",
	applicationId: ticketId,
});
```

### Run auto escalation

```js
const result = await new workflowEngine.AutoEscalationService().run({
	applicationType: "TICKET",
	action: "ESCALATE",
	batchSize: 25,
});
```

## Mental Model Summary

If you remember only one thing, remember this:

- `assigner_rule` decides the first or automatic owner,
- `workflow_application_registry` tells the engine how to reach the business table,
- `assignment` stores current ownership,
- `workflow_action` stores history,
- `workflow_escalation_matrix` decides the next move,
- `Workflow.takeAction()` is the main engine,
- `AutoEscalationService.run()` is just an automated caller of the same engine.

That is the whole design.
