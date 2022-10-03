import axios from 'axios';
import Cookies from 'js-cookie';
import { RegisterUserInfoType } from 'components/types';

const JWT_TOKEN = 'JWT_TOKEN';
const API_URL = 'http://192.168.10.127:3333/api';

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
  userInfo: RegisterUserInfoType,
): Promise<RegisterResponse> => {
  const formData = new FormData();
  /*
    將資料塞進formData中
    由於image是檔案，需要塞進的是檔案內容，所以需要用value[0]來抓取檔案內容
  */
  Object.entries(userInfo).forEach(([key, value]) => {
    if (key === 'image') {
      return formData.append(key, value[0]);
    }
    return formData.append(key, value);
  });

  return axios
    .post(`${API_URL}/signup`, formData, {
      headers: {
        'Content-type': 'multipart/form-data',
      },
    })
    .then(({ data }) => {
      return data;
    })
    .catch(({ response: { data } }) => data);
};
