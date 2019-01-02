// import main css file to get processed by sass and webpack
import 'web/normalize.css';
import style from './main.scss';

import React from 'react';
import { render } from 'react-dom';

import { Header, Greetings } from './components';

const aliens = [
  { name: 'Venusian', underline: false, we: true, make: false, contact: false },
  { name: 'Martian', underline: false, we: false, make: true, contact: false },
  { name: 'Jovian', underline: false, we: false, make: false, contact: true },
  { name: 'Earthling', underline: true, we: true, make: true, contact: true },
];

render(
  <div>
    <Header title="React + JSX + SASS/SCSS + CSS-Modules + Webpack 4.x" />
    <div id="root" className={style.container}>
      {
        aliens.map((alien, index) => <Greetings key={index} {...alien} />)
      }
    </div>
  </div>,
  document.getElementById('root')
);
