import { combineReducers } from 'redux';

import registration from './registration';
import login from './login';

export default combineReducers({ registration, login });
