import {postRequest, getRequest, deleteRequest} from '../index';

export const GetLocationCategories = id =>
  getRequest(`locations/${id}/categories`);

export const GetLocationTables = id =>
  getRequest(`admin/${id}/tables/tableStatus`);

export const GetTables = location_id =>
  getRequest(`admin/${location_id}/floors`);

export const GetSurveyQuestionList = id =>
  getRequest(`/survey/${id}/survey_questions_list`);

export const StartSession = payload =>
  postRequest('locationSessions/start', payload);

export const EndSession = payload =>
  postRequest('locationSessions/end', payload);
export const paymentRequest = payload =>
  postRequest('locationSessions/payment_request', payload);

export const PlaceOrder = (id, payload) =>
  postRequest(`customers/orders/${id}/place_order`, payload);

export const SubmitResponse = (id, payload) =>
  postRequest(`/survey/${id}/response`, payload);

export const ManagerLogin = payload => postRequest('sessions/manager', payload);
export const ManagerLogout = () => getRequest('sessions/app/logout');

export const callWaiter = payload =>
  postRequest('locationSessions/call_waiter', payload);
