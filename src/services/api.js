import axios from 'axios';
import Cookies from 'js-cookie';

const JWT_TOKEN = 'JWT_TOKEN';
const API_URL = 'http://192.168.10.127:3333/api';

const axiosInstance = axios.create();

export const getJWTToken = () => {
  return Cookies.get(JWT_TOKEN);
};

export const cleanToken = () => {
  Cookies.remove(JWT_TOKEN);
  delete axiosInstance.defaults.headers.authorization;
};

export const setToken = (token: string) => {
  Cookies.set(JWT_TOKEN, token);
  axiosInstance.defaults.headers.authorization = `Bearer ${token}`;
};

export const verifyToken = (token: string) => {
  return axios(`${API_URL}/auth`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
    .then(({ data }) => {
      console.log('驗證TOKEN:', data);
      return data;
    })
    .catch(() => {
      console.log('TOKEN 驗證失敗');
      cleanToken();
      return Promise.reject();
    });
};

export type LoginUserType = {
  id: number,
  cpnyId: string,
  cpnyName: string,
  chatbotName: string,
  image: string,
  email: string,
  isAdmin: number,
  role: object,
  createdAt: string,
  updatedAt: string,
};

export type LoginResponseType = {
  token: string,
  user: LoginUserType,
};

export const fetchLogin = (
  email: string,
  password: string,
): Promise<LoginResponseType> => {
  return axios(`${API_URL}/sigin`, {
    method: 'POST',
    body: {
      email,
      password,
    },
  }).then(({ data }) => {
    console.log('login res:', data);
    setToken(data.token);
    return data;
  });
};
