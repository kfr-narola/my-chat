import Axios from 'axios';

const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`,
  withCredentials: true
});

// request Handler
const requestHandler = (config) => {
  const token = localStorage.getItem('token');
  if(token){
    config.headers['Authorization'] = `Bearor ${token}`
  }
  return config;
}
// request Error Handler
const requestErrorHandler = (error) => {
  console.log(error);
  return Promise.reject(error);
}

// response Handler
const responseHandler = (response) => {
  return response;
}

// response Error Handler
const responseErrorHandler = (error) => {
  return Promise.reject(error);
}

axiosInstance.interceptors.request.use(requestHandler, requestErrorHandler);
axiosInstance.interceptors.response.use(responseHandler, responseErrorHandler);

export default axiosInstance;