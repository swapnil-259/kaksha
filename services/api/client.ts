import {getBaseURL} from '@kaksha/services/api/base';
import axios from 'axios';
import {Platform} from 'react-native';

const client = axios.create({
  baseURL: getBaseURL(),
});

client.interceptors.request.use(request => {
  const {cookie} = request;
  if (cookie)
    request.headers.set(
      'Cookie',
      (request.headers.get('Cookie') ?? '') + `sessionid=${cookie};`,
    );
  if (Platform.OS === 'ios') request.withCredentials = false;
  console.log('headers >> ', request.headers);
  return request;
});

client.interceptors.response.use(
  response => {
    // Uncomment when necessary
    console.log('success >> ');
    console.log({
      url: response.request.responseURL,
      response: response.data,
      status: response.status,
    });
    return response;
  },
  error => {
    // Uncomment when necessary
    console.log('error >> ');
    console.log({
      url: error?.request?.responseURL,
      response: error.response?.data,
      status: error?.response?.status,
    });
    return Promise.reject(error);
  },
);

export default client;
