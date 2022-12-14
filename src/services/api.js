import axios from 'axios';
import Cookies from 'js-cookie';
import {
  RegisterUserInfoType,
  UserInfo,
  TrainDataType,
} from 'components/types';
import { Toast } from 'utils/swalInput';

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
  window.sessionStorage.clear();
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
    .then(({ data: { data } }) => {
      axiosInstance.defaults.headers.authorization = `Bearer ${token}`;
      return data;
    })
    .catch(() => {
      cleanToken();
      return Promise.reject();
    });
};

export type LoginResponseType = {
  status: string,
  message: string | null,
  token: string,
  user: UserInfo,
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
    .catch(({ response: { data } }) => data);
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
    .catch(({ response: { data } }) => {
      Toast.fire({
        icon: 'error',
        title: '註冊失敗',
        text: data.message,
      });
    });
};

// 獲取全部資料
export const fetchAllData = (): Promise<TrainDataType> => {
  return axiosInstance
    .get(`${API_URL}/train/allTrainData`)
    .then(({ data: { data } }) => {
      return data;
    })
    .catch((err) => {
      Toast.fire({
        icon: 'error',
        title: err.response.data.message,
      });
    });
};

// 抓取全部action
export const fetchAllAction = (): Promise<string[]> => {
  return axiosInstance
    .get(`${API_URL}/stories/actions`)
    .then(({ data: { data } }) => {
      return data;
    })
    .catch(({ response: { data } }) => {
      Toast.fire({
        icon: 'warning',
        title: '資料發生錯誤',
        text: data.message,
      });
    });
};

// 將訓練檔送回資料庫更新
export const postAllTrainData = (
  trainData: TrainDataType,
): Promise<TrainDataType> => {
  return axiosInstance
    .post(`${API_URL}/train/allTrainData`, trainData)
    .then(({ data }) => {
      return data;
    })
    .catch(({ response: { data } }) => {
      Toast.fire({
        icon: 'warning',
        title: '資料發生錯誤',
        text: data.message,
      });
    });
};

// 確認rasa訓練狀況
export const fetchRasaTrainState = () => {
  return (
    axios
      .get('http://192.168.10.105:5005/status')
      // eslint-disable-next-line camelcase
      .then(({ data }) => {
        return { state: data.num_active_training_jobs };
      })
      .catch((err) => console.log(err))
  );
};
