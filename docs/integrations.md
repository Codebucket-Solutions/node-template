# Canonical Integrations

Use the published integration libraries that are already wired into the
template before building custom transports, upload stacks, PDF renderers, or
pagination SQL.

These examples are mounted under `/v1/examples/*`. SMS, mail, and PDF examples
can talk to live external systems if the matching environment variables are
configured.

## Canonical packages

| Capability                  | Package                      | Shared entry point                        | Example flow                                                                                                         |
| --------------------------- | ---------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| File uploads and downloads  | `@codebucket/files`          | `utils/upload.js`, `middleware/multer.js` | `routes/v1/examples/upload.js` -> `controllers/v1/examples/upload.js` -> `service/v1/examples/upload.js`             |
| SMS delivery                | `@codebucket/sms`            | `utils/message.js`                        | `routes/v1/examples/sms.js` -> `controllers/v1/examples/sms.js` -> `service/v1/examples/sms.js`                      |
| Gateway email delivery      | `@codebucket/mail-transport` | `utils/mail.js`                           | `routes/v1/examples/mail.js` -> `controllers/v1/examples/mail.js` -> `service/v1/examples/mail.js`                   |
| HTML-to-PDF rendering       | `@codebucket/puppet-master`  | `utils/pdf.js`                            | `routes/v1/examples/pdf.js` -> `controllers/v1/examples/pdf.js` -> `service/v1/examples/pdf.js`                      |
| Pagination query generation | `pagi-help/v2`               | `utils/pagination.js`                     | `routes/v1/examples/pagination.js` -> `controllers/v1/examples/pagination.js` -> `service/v1/examples/pagination.js` |

## Example endpoints

- `POST /v1/examples/files/upload`
- `POST /v1/examples/sms/send`
- `POST /v1/examples/mail/send`
- `POST /v1/examples/pdf/render`
- `GET /v1/examples/pagination/offset`
- `GET /v1/examples/pagination/cursor`

## Implementation rules

### Files

- Build Multer middleware through `middleware/multer.js`.
- Keep storage and download behavior in `utils/upload.js`.
- Normalize stored-file responses with `fileUpload(...)`.
- Do not add alternate multipart parsing stacks when the shared helpers already
  fit.

### SMS

- Keep provider selection and credential handling in `utils/message.js`.
- Services should call `messenger(...)` or extend that utility if another
  provider option is needed.
- `MSG91` and `SERVER` example sends should include `templateId`, because those
  transports are wired for template delivery.
- Do not scatter Msg91, Mgov, SmartSol, or custom gateway request code around
  the app.

### Mail

- Keep gateway mail behind Nodemailer in `utils/mail.js`.
- For gateway delivery, use `@codebucket/mail-transport`; for SMTP keep the
  same utility entry point.
- Do not bypass the shared utility with direct HTTP calls to the mail server.

### PDF

- Use `renderPdf(...)` from `utils/pdf.js`.
- Generate the output path in the service layer, then pass HTML and PDF options
  to the package-backed client.
- Do not add a local browser automation stack just to render PDFs.

### Pagination

- Build pagination queries in the service layer with `utils/pagination.js`.
- Execute the generated SQL with Sequelize from the same service.
- Keep routes and controllers free of pagination SQL details.
- Do not write hand-rolled count queries, offset math, or cursor token logic
  when `pagi-help/v2` already supports the use case.
