import request, {RequestType} from '@kaksha/services/api/request';
import _ from 'lodash';
import {useCallback, useState} from 'react';

type useRequestPropsType<T> = {
  requestParams: RequestType;
  initialState: T;
};

const useRequest = <T>({
  requestParams,
  initialState,
}: useRequestPropsType<T>) => {
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const getResponse = useCallback(
    async (params?: RequestType) => {
      if (!loading) {
        setData(initialState);
        setLoading(true);
        const {
          data: responseData,
          status,
          HttpStatusCode,
        } = await request<T>(_.merge(requestParams, params));
        if (status === HttpStatusCode.OK && responseData) {
          setData(responseData);
        }
        setLoading(false);
        return {data: responseData, status, HttpStatusCode};
      }
      return {data: undefined, status: undefined, HttpStatusCode: undefined};
    },
    [loading, requestParams],
  );

  const resetData = useCallback(() => {
    setData(initialState);
  }, []);

  return {
    data,
    loading,
    getResponse,
    resetData,
    setData,
  };
};

export default useRequest;
