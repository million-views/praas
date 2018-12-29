PraaS WebApp
============
Front end to interact with the proxy-as-a-service backend to manage
*conduits*. A conduit is a handle to a RESTful service endpoint.

Features
--------
TBD...

Development
-----------
> If using [Yarn](https://yarnpkg.com/), all instances of `npm` can be replaced with `yarn`. :ok_hand:

### install
```
$ npm install
```

If live-server is not installed globally do so now.
```
# check if live-server is installed
$ which `live-server`

# if not installed, install it now
$ npm install --global live-server
```

### build
```
$ npm run build
```

Compiles all files. Output is sent to the `build` directory.

### start
```
$ npm start
```
Runs your application (from the `build` directory) in the browser.

### watch
```
$ npm run watch
```

Like [`start`](#start), but will auto-compile & auto-reload the server after any file changes within the `app` and `web` directory.

Code organization
-----------------
We want an organization that allows us the ability to get to where we need to.
To that end, we have the following structure at the top level.

```console
project-name
├── build          //<- generated and bundled files ready for deployment
├── LICENSE        //<- for code that is meant to be shared, I recommend ISC, MIT or BSD.
├── package.json   //<- metadata relevant to the project
├── README.md      //<- high level overview and getting started instructions
└── src            //<- 'code' including configuration goes here
```

All 'code' (including configuration to build the code) is kept under 'src' folder...

```console
src
├── api            //<- remote service facade used by the app goes here
├── app            //<- application source (ES6, JSX, SCSS, ...)
├── cfg            //<- webpack build pipeline parts and setup
├── doc            //<- notes, design documents, requirements go here
├── lib            //<- [optional] external libraries in source form (see ATTRIBUTION.md)
├── store          //<- [optional] contains state of the application
└── web            //<- web related assets to be bundled along with code in app and lib folders
```

NOTE:
  I have seen some starter kits name the 'api' folder as 'service', probably
  to suggest that the app uses the 'service'. I prefer 'api' because an app
  may use several different services. Also instructive is to read the differences
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
├── setup.js       //<- tell webpack where things are
├── styles.js      //<- to process css and sass
└── webpack.js     //<- kickstart webpack using this arrangement
```

### Application ###
Application code is under 'app' folder. The file main.js is the entry
point and contains the 'shell' of a PWA.

```console
app
├── components     //<- used by the app
├── main.js        //<- app shell
├── routes         //<- are pages or containers in a flow
└── style          //<- app wide look and feel *may* go here
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
├── site-css       //<- site or app wide look & feel style could go here
:
└── tiny           //<- tiny library that you create to prevent bloat goes here
```
