# PraaS Proxy Server

Follow [instructions to get the servers up](../README.md) before running
gateway tests.

## Testing
Currently, only Airtable functionality is present in the application.
Hence, the tests depend on some configuration on Airtable for the tests
to work. Unfortunately, the Airtable API only allows to operate on an
existing Base and does not allow use to create, update or delete a
Base itself. So, the following assumptions are made that the tester has
to have as a pre-requisite to running the test suite.

- tester has an Airtable account
- tester has setup a Base on their account
- required details, viz, Airtable API Endpoint, API Key, Service
  Object URI are entered correctly in the `.env.conduit-user` file
  ( Refer to the `.env.conduit-user.example` file for example /
  reference of the keys to be used in `.env.conduit-user` )
- `SERVICE_OBJECT_KEY` value corresponds to the Airtable Base
- Airtable Base should be setup with:
  - 3 fields named `name`, `email`, `hiddenFormField`
  - all field names are case sensitive for the purpose of testing
  - the fields **should** be of type `Single line text`
