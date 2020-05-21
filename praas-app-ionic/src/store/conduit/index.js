import { combineReducers } from 'redux';

import get from './get';
import list from './list';
import create from './create';
import del from './del';

export default combineReducers({ current: get, list, create, del });
