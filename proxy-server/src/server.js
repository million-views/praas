const express = require('express');
// const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const conf = require('./config');
const PraasAPI = require('./lib/praas')

// Create global app object
const app = express();

app.use(cors());

/// error handling...
if (conf.production) {
  app.use(function (err, req, res, next) {
    // no stacktraces leaked to user in production mode
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: {}
      }
    });
  });
} else {
  // in development mode, use error handler and print stacktrace
  app.use(errorhandler());
  app.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: err
      }
    });
  });
}

var proxyuser = {
  user:{
    email: 'testme@gmail.com',
    password: 'testme'
  }
};

async function storeProxyuser(proxyuser) {
  try {
    console.log(`Print the user: ${proxyuser.user.email}`);
    const udata = await PraasAPI.user.login(proxyuser.user);
    PraasAPI.setItem('user', JSON.stringify({ ...udata.user }));
  } catch (e) {
    console.error(e);
  }
}



// launch the server and listen only when running as a standalone process
if (!module.parent) {
  app.get('/', (req, res) => res.send('Hi there....PRaaS Proxy server is up and running!'));
  app.listen(conf.port, () => {
    console.log(`Praas Proxy server is listening on port ${conf.port}`);
  });
  console.log(`Proxy username and password: ${process.env.proxyUsername} - ${process.env.proxyPassword}`);
  storeProxyuser(proxyuser);
}
