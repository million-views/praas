# PraaS Proxy Server

Back end REST server to manage *conduits*. A conduit is a handle to a RESTful service endpoint.

## Features

TBD...

## Development

> NOTE:
> Create a .env file at the root of praas folder, at the same location where .env-example file can be found.
> Fill the values of .env file before you start the crud-server or the proxy-server.

### Tasks
|  task     | command line                             | notes                                       |
|:----------|:-----------------------------------------|:--------------------------------------------|
| install   |```npm install```                         | installs dependencies                       |
| lint      |```npm run lint```                        | run eslint on `src` folder                  |
| lint:fix  |```npm run lint:fix```                    | run eslint on `src` folder                  |
| start     |```npm run start```                       | start the proxy server                      |