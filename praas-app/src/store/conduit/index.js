import { combineReducers } from 'redux';

import list from './list';
import create from './create';
import draft from './draft';

export default combineReducers({ list, create, draft });
