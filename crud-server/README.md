# PraaS Back end

Back end REST server to manage *conduits*. A conduit is a handle to a RESTful service endpoint.

## Features

TBD...

## Development

> NOTE:
> 1 - Integration tests require bootstrap data created by the unit tests.
> So, make sure to run unit tests (test-model) first before running the
> integration tests (test-rest).

> 2 - Create .env file at the root of praas folder, at the same location where .env-example file can be found.
> Fill the values of .env file before you start the crud-server or the proxy-server.

### Tasks
|  task     | command line                             | notes                                       |
|:----------|:-----------------------------------------|:--------------------------------------------|
| install   |```npm install```                         | installs dependencies                       |
| lint      |```npm run lint```                        | run eslint on `src` folder                  |
| lint:fix  |```npm run lint:fix```                    | run eslint on `src` folder                  |
| test-model|```npm run test-model```                  | run data layer unit tests                   |
| test-rest |```npm run test-rest```                   | run REST endpoint integration tests         |
| start     |```npm run start```                       | web serve `build` folder                    |
| createdb  |```npm run createdb```                    | Creates a new db file with username: admin@praas.com  password: praas  |

## Praas Data Model

Consists of the three entities: System, User, Conduit

### System Table

System stores all configuration related settings and their values.
For now storing the config in json format as there are
only few values. Will store as database entity when more values need
to be stored.

### User Table

User stores registered user(s) info. an user can have one or more conduits.

#### Fields

|  name     | description          | constraints       |
|:----------|:---------------------|:------------------|
| firstName |First name of the user| not null          |
| lastName  |Last name of the user | not null          |
| email     |Email of the user     | not null, unique  |
| hash      |Password of the user  | not null          |
| salt      |Random hex value      | not null          |

### Conduit Table

Conduit stores data related to the service endpoint

#### Fields

|  name           | description                                       | constraints                    |
|:----------------|:--------------------------------------------------|:-------------------------------|
| suriApiKey      |Service URI API Key                                |not null                        |
| suriType        |The type of conduit (AirTable, Google Sheets)      |not null                        |
| suriObjectKey   |Key to identify the object                         |null                            |
| suri            |Service URI (AirTable URI)                         |not null                        |
| curi            |System generated conduit URI                       |not null, unique                |
| whitelist       |Allowed ip list                                    |not null                        |
| racm            |(Request Access Control Map - GET/POST/DEL/PUT...) |not null                        |
| throttle        |Limit requests to 5/sec to avoid DOS attack        |not null, defaults to 'true'    |
| status          |active/inactive                                    |not null, defaults to 'inactive'|
| description     |Notes about the conduit                            |null                            |
| hiddenFormField |To avoid bot spamming                              |null                            |

\* whitelist is an array of objects with the following properties:

| Property  | Description        |
|:----------|:-------------------|
| ip        | ip address         |
| comment   | comment            |
| status    | `active` or `inactive` |

\* racm is an array of allowed methods

\* hiddenFormField is an array of objects with the following properties:

| Property  | Description                     |
|:----------|:--------------------------------|
| fieldName | name of the field               |
| policy    | `drop-if-filled` or `pass-if-match` |
| include   | boolean indicating if the field should be sent to the suri |
| value     | Value to be matched against the field in case of `pass-if-match` |
