This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## About this project

This project is a visual testing for the various capabilities of the conduits. The conduits can be created with the following access methods enabled:

1. GET
2. POST
3. PATCH
4. PUT
5. DELETE

These resemble the various CRUD operations and follow the same concepts behind.
The project demonstrates the capability of the different conduits with varying access method controls performing the respective permitted actions.

## Setting up the right proxy when working in local machine

When working against the local gateway server running in port 5000, you will have to add the conduit URI's used for testing in the `/etc/hosts/` file so that it acts as a proxy. This could be replaced later when we have a hosted solution.
Eg: if we use conduit `www.abc.trickle.cc` then we have to have an entry in `/etc/hosts` as

```
127.0.0.1 www.abc.trickle.cc
```
