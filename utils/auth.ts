import KEYS from '@kaksha/constants/keys';
import URLS from '@kaksha/constants/urls';
import request, {ResponseType} from '@kaksha/services/api/request';
import {UserI, login, logout} from '@kaksha/store/auth';
import {SessionValue} from '@kaksha/types/user';
import {AxiosResponse} from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';

type EmployeeInfoFetchDataResponse = {
  data_d: {
    current_session: number;
    session: SessionValue[];
  };
};

type ModulesFetchResponse = {
  Modules: {id: number; code: string; name: string}[];
};

const checkStoredCookie = async () => {
  return await EncryptedStorage.getItem(KEYS.cookie);
};

const parseCookie = (headers: AxiosResponse['headers']) => {
  const cookie = headers['set-cookie']?.at(0)?.split(';').at(0)?.split('=');
  if (cookie && cookie?.at(0) === 'sessionid') {
    return cookie.at(1);
  }
};

const initiateLogin = async (cookie: string, setCookie?: boolean) => {
  const {data, status, HttpStatusCode} = await request<ResponseType<UserI[]>>({
    method: 'GET',
    url: URLS.auth.dashboard.view_profile,
    cookie,
  });
  if (status === HttpStatusCode.OK && data) {
    const {
      status,
      HttpStatusCode,
      data: session_data,
    } = await request<EmployeeInfoFetchDataResponse>({
      method: 'GET',
      url: URLS.auth.musterroll.update_employee.info,
      params: {
        request_type: 'update_fetch_data',
      },
      cookie,
    });
    if (status === HttpStatusCode.OK && session_data) {
      const {data: modules_data} = await request<ModulesFetchResponse>({
        method: 'GET',
        url: URLS.auth.dashboard.getModules,
        cookie,
      });
      const modules = modules_data?.Modules.map(each => each.code) ?? [];
      login(data.data[0], cookie, session_data.data_d, modules);
      try {
        if (setCookie) await EncryptedStorage.setItem(KEYS.cookie, cookie);
      } catch (e) {
        console.log(e);
      }
      return Promise.resolve(true);
    }
  }
  return Promise.resolve(false);
};

const initiateLogout = () => {
  request({method: 'GET', url: URLS.auth.logout, showError: false});
  logout();
  [KEYS.cookie, KEYS.theme].forEach(key => {
    try {
      EncryptedStorage.removeItem(key);
    } catch (e) {
      console.log(e);
    }
  });
};

export {checkStoredCookie, initiateLogin, initiateLogout, parseCookie};
