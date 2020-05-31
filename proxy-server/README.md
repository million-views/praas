# PraaS Proxy Server

Back end REST server to manage *conduits*. A conduit is a handle to a RESTful service endpoint.

## Features

TBD...

## Development

### Prerequisits
1. Create a .env file at the root of praas folder, at the same location where .env-example file can be found.
2. Fill the values of .env file before you start the **crud-server**.
    - PROXY_SERVER_EMAIL
    - PROXY_SERVER_PASSWORD
3. The above values will be used to create a ___new Praas user___ if it doesn't exist.
4. :warning: Start the **crud-server** first (make sure you follow all steps in [crud-server README - Tasks](https://github.com/million-views/praas/tree/master/crud-server#tasks) before you start the crud-server), then start the **proxy-server**.



### Tasks
|  task     | command line                             | notes                                       |
|:----------|:-----------------------------------------|:--------------------------------------------|
| install   |```npm install```                         | installs dependencies                       |
| lint      |```npm run lint```                        | run eslint on `src` folder                  |
| lint:fix  |```npm run lint:fix```                    | run eslint on `src` folder                  |
| start     |```npm run start```                       | start the proxy server                      |
