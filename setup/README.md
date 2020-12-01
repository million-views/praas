# Setup Guide for Developers
You will need an API key or service account from either Airtable or Google
before you can proceed with the backend setup.
## Backend

Two [`.env`][1] files are required to get started. Both of these files should
be present in the backend folder relative to the root of the repository.

[1]: https://github.com/rolodato/dotenv-safe "Safe Dot Env"
---

> Copy `.env-example` as `.env`<br>
> Copy `.env.conduit-user.example` as `.env.conduit-user`

---
s
1. A global `.env` file containing client credentials for the
   **proxy-server**

   - `PROXY_SERVER_EMAIL`   : typically an email address belonging to a domain you manage
   - `PROXY_SERVER_PASSWORD`: typically a system generated hash

   The above values will be used to authenticate the **_proxy_**
   with the **_resource server_**.
   <br>
   Notes:
   1. Create `.env` file  and set required variables before starting the
      **crud-server**; otherwise, it will fail to start.
   2. This is a workaround until we have proper client credentials management in place.

2. A `.env.conduit-user` that contains credentials related to the functioning of
   the conduit resource management server. This includes information about the 
   external service and user details. This is required for testing the proxy server.
   ```code
      CONDUIT_SERVICE_TYPE=one of {airtable|googleSheets|email}
      CONDUIT_SERVICE_API_KEY=do not share your secrets
      CONDUIT_SERVICE_OBJECT_KEY=variable portion that identifies the object
   ```
3. Integration tests require bootstrap data created by unit tests. So,
   `npm run test-model` first before testing the REST api. Alternatively
   you can also run `npm run createdb`.

### Running the servers

1. Install dependencies by `npm install`
2. Populate test data by running `test-model`
3. Start the resource server by running `start-resource-server`
4. Start the proxy server by running `start-gateway-server`
## Debugging

Error responses and stack traces can be logged to the console by setting
the `DUMP_ERROR_RESPONSE` and `DUMP_STACK_TRACE` environment variables.
The features can be enabled by prepending the environment variable with
the `npm` task command.

`DUMP_ERROR_RESPONSE=1 DUMP_STACK_TRACE=1 npm run <task-name>`
## Airtable

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
- Two fields needed are the Base ID and API Key generated 
## Googlesheets
- Coming soon
## Developer Tasks
| task                                           | command line                       |
| :--------------------------------------------- | :--------------------------------- |
| Install dependencies                           | `npm install`                      |
| Run linter                                     | `npm run lint`                     |
| Fix lint errors                                | `npm run lint:fix`                 |
| Run data layer tests                           | `npm run test-model`               |
| Run data layer tests with code coverage        | `npm run test-model-with-coverage` |
| Run REST api tests                             | `npm run test-rest`                |
| Run REST api tests with code coverage          | `npm run test-rest-with-coverage`  |
| Run gateway tests                              | `npm run test-gateway`             |
| Run resource server                            | `npm run start-resource-server`    |
| Run gateway server                             | `npm run start-gateway-server`     |
| Init db with user: admin@praas.com, pwd: praas | `npm run createdb`                 |

### Running tests

To execute the gateway tests, execute the following commands in the order after adding the necessary configs in .env.conduit-user file.
Open a terminal, one for the gateway server and one for the resource server

1. Add the proxys - `./util/loopback-network.sh add`
2. Generate test data - `npm run test-model`. The model testing also generates some curi test data required during the gateway testing.
3. Run the resource server - `npm run start-resource-server`
4. Run the gateway server - `npm run start-gateway-server`
5. Run the gateway tests - `npm run test-gateway`
6. Clean up proxys - `./util/loopback-network.sh del`

# PraaS WebApp/Frontend

Front end to interact with the proxy-as-a-service backend to manage
_conduits_. A conduit is a handle to a RESTful service endpoint.

- These commands need to be entered from the PraaS WebApp folder relative to the root of the repository

## Development

> If using [Yarn](https://yarnpkg.com/), `yarn` can replace all occurences
> of `npm` in the command line below. :ok_hand:
> If you don't have node.js, install [nvm](https://github.com/nvm-sh/nvm), is a version manager for [node.js](https://nodejs.org/en/).

### Tasks
Run the tasks below to start the front end

| task       | command line       | notes                                          |
| :--------- | :----------------- | :--------------------------------------------- |
| install    | `npm install`      | installs dependencies                          |
| lint       | `npm run lint`     | run eslint on `src` folder                     |
| lint:fix   | `npm run lint:fix` | run eslint on `src` folder                     |
| build      | `npm run build`    | compile to `build` folder                      |
| start      | `npm run start`    | web serve `build` folder                       |
| watch      | `npm run watch`    | watch/build changes to `app` and `web` folders |
| test       | `npm run test `    | run tests and report coverage                  |
| test:watch | `npm run test `    | run tests in watch mode without coverage       |



