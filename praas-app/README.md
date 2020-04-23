PraaS WebApp
============
Front end to interact with the proxy-as-a-service backend to manage
*conduits*. A conduit is a handle to a RESTful service endpoint.

Features
--------
TBD...

Development
-----------
> If using [Yarn](https://yarnpkg.com/), `yarn` can replace all occurences
> of `npm` in the command line below. :ok_hand:
> If you don't have node.js, install [nvm](https://github.com/nvm-sh/nvm) is a version manager for [node.js](https://nodejs.org/en/).

If live-server is not installed globally do so now.
```
# is live-server installed ?
$ which `live-server`

# if not installed, install it now
$ npm install --global live-server
```
### Tasks
|  task   | command line      | notes                                                     |
|:--------|:------------------|:----------------------------------------------------------|
| install |```npm ci```       | new commers install dependencies in sync with your peers  |
|         |    or             |                                                           |
| install |```npm install```  | installs dependencies                                     |
| lint    |```npm run lint``` | run eslint on `src` folder                                |
| build   |```npm run build```| compile to `build` folder                                 |
| start   |```npm run start```| web serve `build` folder                                  |
| watch   |```npm run watch```| watch/build changes to `app` and `web` folders            |

Code organization
-----------------
We want an organization that allows us the ability to get to where we need to.
To that end, we have the following structure at the top level.

```console
project-name
├── build          //<- generated and bundled files ready for deployment
├── LICENSE        //<- pick one of ISC, MIT or BSD for open source projects
├── package.json   //<- metadata relevant to the project
├── README.md      //<- high level overview and getting started instructions
└── src            //<- 'code' including configuration goes here
```

All 'code' (including configuration to build the code) is under 'src' folder...

```console
src
├── api            //<- remote service facade used by the app goes here
├── app            //<- application source (ES6, JSX, SCSS, ...)
├── cfg            //<- webpack build pipeline parts and setup
├── doc            //<- notes, design documents, requirements go here
├── lib            //<- [optional] external libraries in source form (see ATTRIBUTION.md)
├── store          //<- [optional] contains state of the application
└── web            //<- web related assets bundled with code in app and lib folders
```

NOTE:
  I have seen some starter kits name the 'api' folder as 'service', probably
  to suggest that the app uses the 'service'. I prefer 'api' because an app
  may use different services. Also instructive is to read the differences
  between  [facade and service](https://stackoverflow.com/questions/15038324/are-the-roles-of-a-service-and-a-fa%c3%a7ade-similar#15079958)

### Webpack ###
Webpack configuration files are under 'cfg' folder and organized as a collection
of parts merged together by webpack.js which is the entry point to webpack.

```console
cfg/
├── babel.js       //<- for transpiling
├── development.js //<- used in development mode
├── eslint.js      //<- lint code
├── optimize.js    //<- used in production mode (optimize, minify, ...)
├── setup.js       //<- tell webpack how to bundle code and assets
├── styles.js      //<- to process css and sass
└── webpack.js     //<- kickstart webpack using this arrangement
```

### Application ###
Application code is under 'app' folder. The file main.js is the entry
point and contains the 'shell' of a PWA.

```console
app
├── components     //<- reusable widgets within the app
├── main.js        //<- app shell
├── main.scss      //<- app wide look and feel *may* go here
├── routes         //<- are pages or containers in a flow
```
### Application State ###
The global state of an application is under 'store' folder, optionally present
when an application requires complex state management. We refer using the 'ducks'
way of organizing the store when using Redux.

### Web Assets ###
HTML, templates, images, icons and other visual and structural assets are in
the 'web' folder. These are then copied to the 'build' folder during the build
process.

```console
web
├── assets
├── index.ejs
:
└── manifest.json
```

### Third party libraries ###
External libraries used in source form are under 'lib' folder. The
ATTRIBUTION.md file contains a list of such libraries used by the application
and in what form.

```console
lib
├── ATTRIBUTION.md //<- FOSS packages used by the app listed here
├── kiscss         //<- keep it simple css
:
└── tiny           //<- tiny library that you create to prevent bloat goes here
```
