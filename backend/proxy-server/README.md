# PraaS Proxy Server

Back end REST server to manage _conduits_. A conduit is a handle to a RESTful service endpoint.

## Features

TBD...

## Development

### Prerequisites

Two `.env` files are required to test **proxy-server**. Both of
these files are supposed to be present in the backend folder relative to
the root of the repository ( at the same location where the `.env-example`
file can be found )
1. A global `.env` file containing client credentials for the
   **proxy-server**
   - `PROXY_SERVER_EMAIL`
   - `PROXY_SERVER_PASSWORD`

   The above values will be used to authenticate the **_Praas user_**
   <br>
   Refer to the `.env-example` for more accurate information
   on what variables are supposed to be in the actual global
   `.env` file.
   <br>
   Notes:
   1. Create and populate this file before starting the
      **crud-server**; otherwise, it will fail to start.
   2. This is a workaround until we have proper user
      management in place.
2. A `.env.conduit-user` that contains credentials related to
   the functioning of the conduit service. This includes
   information about the external service and user details.
   This is required for testing the proxy server.

:warning: Start the **crud-server** first (make sure you
follow all steps in [crud-server#Tasks] before you start the
crud-server), then start the **proxy-server**.

### Testing

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
- Airtable Base has at least 3 fields with names - `name`, `email`,
  `hiddenFormField` ( all field names are case sensitive since they are
  hard-coded into the test data )

### Tasks

| task     | command line       | notes                      |
| :------- | :----------------- | :------------------------- |
| install  | `npm install`      | installs dependencies      |
| lint     | `npm run lint`     | run eslint on `src` folder |
| lint:fix | `npm run lint:fix` | run eslint on `src` folder |
| start    | `npm run start`    | start the proxy server     |

[crud-server#Tasks]: ../crud-server/README.md#tasks
