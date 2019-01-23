import { combineReducers } from 'redux';

import list from './list';
import create from './create';

export default combineReducers({ list, create });
