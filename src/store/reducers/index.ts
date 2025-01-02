import { combineReducers } from 'redux';
import userReducer from './userSlice';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import employerReducer from './employersSlice';
import jobReducer from './jobSlice';
import userApplicationsReducer from './userApplicationsSlice';
import eventReducer from './eventSlice';
import partnerSlice from './partnerSlice';
import messageReducer from './messageSlice';
import classSlice from './classSlice';
import sessionSlice from './sessionSlice';
import todoSlice from './todoSlice';
import programSlice from './programSlice';

const rootReducer = combineReducers({
  user: userReducer,
  employer: employerReducer,
  auth: authReducer,
  chat: chatReducer,
  userApplication: userApplicationsReducer,
  job: jobReducer,
  event: eventReducer,
  message: messageReducer,
  partner: partnerSlice,
  class: classSlice,
  session: sessionSlice,
  todo: todoSlice,
  programs: programSlice,
});

export default rootReducer;
