# PraaS Resource Server
REST server to manage *users* and *conduits*. 

# Data Model
Consists of the three entities: System, User, Conduit. These entities are
currently not normalized and subject to breaking design changes.

## System Table
System stores all configuration related settings and their values.
For now storing the config is stored in a js file for convenience. At some
point we may move this information into a database.

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
| suriObjectKey   |Key to locate an object at the NTS provider        |not null                        |
| curi            |System generated conduit URI                       |not null, unique                |
| allowlist       |Allowed ip list                                    |not null                        |
| racm            |Request Access Control Map |not null               |not null                        |
| throttle        |Limit requests to 5/sec to avoid DOS attack        |not null, defaults to 'true'    |
| status          |active/inactive                                    |not null, defaults to 'inactive'|
| description     |Notes about the conduit                            |null                            |
| hiddenFormField |To avoid bot spamming or manage campaigns          |null                            |

#### suriType
Enum: plan is to support AirTable, Google Sheets, Smartsheet.

#### allowlist
JSON: containing an array of objects with the following properties:

| Property  | Description            | constraint |
|:----------|:-----------------------|:-----------|
| ip        | ip address             | required   |
| comment   | comment                | optional   |
| status    | `active` or `inactive` | required   |

#### racm
JSON: containing an array of allowed HTTP methods. The accepted 
methods are:  GET, PUT, POST, PATCH, DELETE. 

At least one method must be present in this array. The default value for
this field is set to `['GET']` if this field is not present in the request.

TBD: add reference to the conduits API here.

#### hiddenFormField
JSON blob: containing an array of objects with the following properties:

| Property  | Description                                                      |
|:----------|:-----------------------------------------------------------------|
| fieldName | name of the field                                                |
| policy    | `drop-if-filled` or `pass-if-match`                              |
| include   | boolean indicating if the field should be sent to target         |
| value     | Value to be matched against the field in case of `pass-if-match` |
