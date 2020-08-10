import { combineReducers } from 'redux';

import list from './list';
import edit from './edit';
import create from './create';
import del from './del';

export default combineReducers({ list, create, edit, del });
