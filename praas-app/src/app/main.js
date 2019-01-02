// import main css file to get processed by sass and webpack
import 'web/normalize.css';
import './main.scss';

import React from 'react';
import { render } from 'react-dom';

import App from './App.js';

render(<App />, document.getElementById('root'));
