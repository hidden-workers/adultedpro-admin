import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
export const axiosInstance = axios.create({
  // baseURL: 'http://localhost:8080/api',
  baseURL: 'http://34.136.38.165/api',
});
const ResponseInterceptor = (response: AxiosResponse) => {
  return response;
};
const RequestInterceptor = async (config: AxiosRequestConfig) => {
  const accessToken = localStorage.getItem('Access_Token');
  config.headers.Authorization = 'Bearer ' + accessToken;
  return config;
};
// @ts-expect-error: TypeScript may give error.
axiosInstance.interceptors.request.use(RequestInterceptor);
axiosInstance.interceptors.response.use(ResponseInterceptor, async (error) => {
  if (error?.message === 'Network Error') {
    alert('Please Connect To Internet');
  }
  const expectedErrors =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;
  if (!expectedErrors) {
    console.log('error', error);
    return;
  } else {
    if (error.response.status === 401) {
      localStorage.removeItem('Email');
      localStorage.removeItem('userId');
    }
    return Promise.reject(error);
  }
});
