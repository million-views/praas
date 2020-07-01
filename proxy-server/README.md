# PraaS Proxy Server

Back end REST server to manage _conduits_. A conduit is a handle to a RESTful service endpoint.

## Features

TBD...

## Development

### Prerequisites

Two `.env` files are required to test **proxy-server**. Both of
these files are supposed to be present at the root of the
repository ( at the same location where the `.env-example`
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
2. A `.env.conduit` that contains credentials related to the
   external service. This is required for testing the proxy
   server.

:warning: Start the **crud-server** first (make sure you
follow all steps in [crud-server#Tasks] before you start the
crud-server), then start the **proxy-server**.

### Tasks

| task     | command line       | notes                      |
| :------- | :----------------- | :------------------------- |
| install  | `npm install`      | installs dependencies      |
| lint     | `npm run lint`     | run eslint on `src` folder |
| lint:fix | `npm run lint:fix` | run eslint on `src` folder |
| start    | `npm run start`    | start the proxy server     |

[crud-server#Tasks]: ../crud-server/README.md#tasks
