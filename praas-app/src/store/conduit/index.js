import { combineReducers } from 'redux';

import list, { listConduits } from './list';
import edit, { updateConduit, getConduit } from './edit';
import create, { addConduit } from './create';
import del, { deleteConduit } from './del';

export default combineReducers({ list, create, edit, del });
export {
  listConduits, updateConduit, getConduit, addConduit, deleteConduit
};
