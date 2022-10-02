import axios from 'axios';
import Cookies from 'js-cookie';

const JWT_TOKEN = 'JWT_TOKEN';
const API_URL = 'http://192.168.0.144:3333/api';

const axiosInstance = axios.create();

// 抓取瀏覽器Token
export const getJWTToken = () => {
  return Cookies.get(JWT_TOKEN);
};

// 清除Token
export const cleanToken = () => {
  Cookies.remove(JWT_TOKEN);
  delete axiosInstance.defaults.headers.authorization;
};

// 設定Token
export const setToken = (token: string) => {
  Cookies.set(JWT_TOKEN, token);
  axiosInstance.defaults.headers.authorization = `Bearer ${token}`;
};

// 驗證Token
export const verifyToken = (token: string) => {
  return axios(`${API_URL}/auth`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })
    .then(({ data }) => {
      return data;
    })
    .catch(() => {
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
  status: string,
  message: string | null,
  token: string,
  user: LoginUserType,
};

// 登入
export const fetchLogin = (
  email: string,
  password: string,
): Promise<LoginResponseType> => {
  return axios
    .post(`${API_URL}/signin`, {
      email,
      password,
    })
    .then(({ data }) => {
      console.log(data);
      setToken(data.token);
      return data;
    })
    .catch(({ response: { data } }) => {
      return data;
    });
};

export type RegisterUserType = {
  id: number,
  cpnyId: string,
  cpnyName: string,
  chatbotName: string,
  image: string,
  email: string,
  createdAt: string,
  updatedAt: string,
};

export type RegisterResponse = {
  statue: string,
  message: string | null,
  user: RegisterUserType,
};

// 註冊
export const fetchRegister = (
  cpnyId: string,
  cpnyName: string,
  chatbotName: string,
  email: string,
  password: string,
  passwordCheck: string,
  image: file,
): Promise<RegisterResponse> => {
  return axios
    .post(`${API_URL}/signup`, {
      cpnyId,
      cpnyName,
      chatbotName,
      email,
      password,
      passwordCheck,
      image,
    })
    .then((data) => {
      console.log('fetch register:', data);
      return data;
    })
    .catch((err) => console.log(err));
};
