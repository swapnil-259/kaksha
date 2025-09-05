import {showToast} from '@kaksha/services/toast';
import {authStore} from '@kaksha/store/auth';
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import HttpStatusCode from './HttpStatusCode';
import client from './client';

type ResponseType<T, Success = true> = {
  data: T;
  msg: string;
  success: Success;
};

type RequestType = AxiosRequestConfig & {
  showError?: boolean;
  useCookie?: boolean;
};

const request = <T>({
  method,
  url,
  params,
  data: requestData,
  showError,
  headers: headerConfig,
  useCookie,
  ...config
}: RequestType) =>
  (async () => {
    try {
      const response: AxiosResponse = await client({
        method,
        url,
        data: method === 'GET' ? undefined : requestData,
        params,
        headers: {
          ...headerConfig,
          'Content-Type':
            requestData instanceof FormData
              ? 'multipart/form-data'
              : 'application/json',
        },
        cookie: useCookie ?? true ? authStore.cookie : undefined,
        withCredentials: useCookie ?? true,
        ...config,
      });

      const {data, status}: {data: T; status: number} = response;
      return {
        data,
        status,
        HttpStatusCode,
        response,
      };
    } catch (err: any) {
      if (!axios.isAxiosError(err)) {
        if (showError !== false) {
          showToast({
            title: 'Opps!',
            description:
              'An unexpected error has occurred while processing your request!',
            type: 'error',
            index: 1,
          });
        }
        return {
          status: undefined,
          HttpStatusCode,
        };
      }
      const data = err.response?.data as ResponseType<null, false>;
      if (showError !== false && data) {
        showToast({
          title: 'Ops! An Error has occurred!',
          description: data.msg,
          type: 'error',
          index: 1,
        });
      }
      return {
        status: err.response?.status,
        HttpStatusCode,
      };
    }
  })();

export type {RequestType, ResponseType};
export default request;
