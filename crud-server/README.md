# Praas Data Model

Consists of the three entities: System, User, Conduit

## System Table

System stores all configuration related settings and their values. 
For now storing the config in json format as there are
only few values. Will store as database entity when more values need
to be stored.

## User Table

User stores registered user(s) info. an user can have one or more conduits.

### Fields

|  name     | description          | constraints       |
|:----------|:---------------------|:------------------|
| firstName |First name of the user| not null          |
| lastName  |Last name of the user | not null          |
| email     |Email of the user     | not null, unique  |
| hash      |Password of the user  | not null          |
| salt      |Random hex value      | not null          |

## Conduit Table

Conduit stores data related to the service endpoint 

### Fields

|  name           | description                                       | constraints                      |
|:----------------|:--------------------------------------------------|:---------------------------------|
| suriApiKey      |Service URI API Key                                |not null                         |
| suriType        |The type of conduit (AirTable, Google Sheets)      |not null                         |
| suriObjectKey   |Key to identify the object                         |null                             |
| suri            |Service URI (AirTable URI)                         |not null                         |
| curi            |System generated conduit URI                       |not null, unique                 |
| whitelist       |Allowed ip list                                    |not null                         |
| racm            |(Request Access Control Map - GET/POST/DEL/PUT...) |not null                         | 
| throttle        |Limit requests to 5/sec to avoid DOS attack        |not null, defaults to 'true'     |
| status          |Active/Inactive                                    |not null, defaults to 'Inactive' |
| description     |Notes about the conduit                            |null                              |
| hiddenFormField |To avoid bot spamming                              |null                              |
