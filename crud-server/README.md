# PraaS Back end
REST server to manage *conduits*. A conduit is a handle to a RESTful 
service endpoint.

# Features
TBD...

# Development
> NOTE: <br>
> 1. Integration tests require bootstrap data created by unit tests. So,
>    `npm run test-model` first before testing the REST api. Alternatively
>    you can also run `npm run createdb`.
>
> 2. Create .env file at the root of praas folder, at the same location
>    where .env-example file can be found. Fill the values of .env file
>    before you start the crud-server or the proxy-server.

## Developer Tasks
|  task                                           | command line                        |
|:------------------------------------------------|:------------------------------------|
| Install dependencies                            |`npm install`                        |
| Run linter on `src`                             |`npm run lint`                       |
| Fix lint errors                                 |`npm run lint:fix`                   |
| Run data layer tests                            |`npm run test-model`                 |
| Run data layer tests with code coverage         |`npm run test-model-with-coverage`   |
| Run REST api tests                              |`npm run test-rest`                  |
| Run REST api tests with code coverage           |`npm run test-rest-with-coverage`    |
| Run conduits resource server                    |`npm run start`                      |
| Init db with user: admin@praas.com, pwd: praas  |`npm run createdb`                   |

# Praas Data Model
Consists of the three entities: System, User, Conduit. These entities are
currently not normalized and subject to breaking design changes.

## System Table
System stores all configuration related settings and their values.
For now storing the config in json format as there are
only few values. Will store as database entity when more values need
to be stored.

## User Table
User stores details of registered users. Users can have zero or more conduits.

### Fields
|  name     | description          | constraints       |
|:----------|:---------------------|:------------------|
| firstName |First name of the user| not null          |
| lastName  |Last name of the user | not null          |
| email     |Email of the user     | not null, unique  |
| hash      |Password of the user  | not null          |
| salt      |Random hex value      | not null          |

## Conduit Table
Conduit stores data related to a non-traditional-storage service endpoint.

### Fields
|  name           | description                                       | constraints                    |
|:----------------|:--------------------------------------------------|:-------------------------------|
| suriApiKey      |Service URI API Key                                |not null                        |
| suriType        |The type of conduit                                |not null                        |
| suriObjectKey   |Key to locate an object at the NTS provider        |null                            |
| suri            |Service URI (AirTable URI)                         |not null                        |
| curi            |System generated conduit URI                       |not null, unique                |
| whitelist (1)   |Allowed ip list                                    |not null                        |
| racm            |Request Access Control Map |not null               |not null                        |
| throttle        |Limit requests to 5/sec to avoid DOS attack        |not null, defaults to 'true'    |
| status          |active/inactive                                    |not null, defaults to 'inactive'|
| description     |Notes about the conduit                            |null                            |
| hiddenFormField |To avoid bot spamming or manage campaigns          |null                            |

#### suriType
Enum: plan is to support AirTable, Google Sheets, Smartsheet.

#### whitelist
JSON: containing an array of objects with the following properties:

| Property  | Description            |
|:----------|:-----------------------|
| ip        | ip address             |
| comment   | comment                |
| status    | `active` or `inactive` |

#### racm
JSON: containing an array of allowed HTTP methods. The accepted 
methods are:  GET, PUT, POST, PATCH, DELETE.

TBD: add reference to the conduits API here.

#### hiddenFormField
JSON blob: containing an array of objects with the following properties:

| Property  | Description                                                      |
|:----------|:-----------------------------------------------------------------|
| fieldName | name of the field                                                |
| policy    | `drop-if-filled` or `pass-if-match`                              |
| include   | boolean indicating if the field should be sent to the suri       |
| value     | Value to be matched against the field in case of `pass-if-match` |
