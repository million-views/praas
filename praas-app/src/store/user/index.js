import { combineReducers } from 'redux';

import registration from './registration';
import login, { loginUser, logoutUser } from './login';

export default combineReducers({ registration, login });
export { loginUser, logoutUser };
