import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    cookie?: string | null;
  }
}
