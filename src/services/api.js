import axios from 'axios';
import Cookies from 'js-cookie';
import {
  RegisterUserInfoType,
  UserInfo,
  TrainDataType,
} from 'components/types';
import { Toast } from 'utils/swalInput';
import type { ApiTrainDataType } from 'components/types';

const JWT_TOKEN = 'JWT_TOKEN';
// const API_URL = 'http://192.168.1.118:3333/api';
const API_URL = 'http://192.168.10.103:3333/api';

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
    .catch(({ response: { data } }) => console.log(data));
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
      }).then(() => {
        cleanToken();
        window.location.reload();
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
        icon: 'error',
        title: data.message,
      }).then(() => {
        cleanToken();
        window.location.reload();
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
        icon: 'error',
        title: data.message,
      }).then(() => {
        cleanToken();
        window.location.reload();
      });
    });
};

// 確認rasa訓練狀況
export const fetchRasaTrainState = () => {
  return axios
    .get('http://192.168.10.105:5005/status')
    .then(({ data }) => {
      return data.num_active_training_jobs;
    })
    .catch((err) => console.log(err));
};

// 發送訓練檔至rasa訓練
export const postTrainDataToRasa = (currentData: ApiTrainDataType) => {
  return axios(
    'http://192.168.10.105:5005/model/train?save_to_default_model_directory=true&force_training=true',
    {
      method: 'POST',
      data: JSON.stringify(currentData),
      headers: {
        'content-Type': 'application/json',
      },
    },
  )
    .then((res) => res.headers.filename)
    .catch((err) => console.log(err));
};

// 發送最新訓練完成的model名稱至rasa套用model
export const loadedNewModel = (fileName: string) => {
  const payload = {
    model_file: `/home/bill/Work/BF36_RASA_2.8.31_spacy/models/${fileName}`,
  };
  return axios('http://192.168.10.105:5005/model', {
    method: 'PUT',
    data: JSON.stringify(payload),
    headers: {
      'content-Type': 'application/json',
    },
  })
    .then((res) => res)
    .catch((err) => console.log(err));
};

export type Categories = {
  id: string,
  name: string,
  cpnyId: string,
  createdAt: string,
  updatedAt: string,
};

// 獲取故事類別
export const fetchAllCategories = (): Promise<Categories[]> => {
  return axiosInstance
    .get(`${API_URL}/train/categories`)
    .then((categories) => {
      return categories.data.data;
    })
    .catch((err) => console.log(err));
};

// 創建故事類別
export const postCategory = (category: string): Promise<Categories[]> => {
  const payload = { name: category };
  return axiosInstance
    .post(`${API_URL}/train/category`, payload)
    .then((categories) => categories.data.data)
    .catch((err) => console.log(err));
};

// 刪除故事類別
export const deleteCategory = (category: string): Promise<Categories[]> => {
  console.log('category name ===> ', category);
  const payload = { name: category };
  return axiosInstance
    .delete(`${API_URL}/train/category`, { data: payload })
    .then((categories) => categories.data.data)
    .catch((err) => console.log(err));
};

export const fetchTextToVoice = (text: string) => {
  console.log('fetch text ===> ', text);
  axios
    .get(`http://192.168.10.105:8888/text2voice?text=${text}`)
    .then((res) => console.log('res ===> ', res))
    .catch((err) => console.log(err));
};

export const paddleSpeech = (text: string) => {
  axios
    .post(`http://192.168.10.105:8010/tts/offline`, { text })
    .then((res) => {
      console.log('get text2voice base64 ==> ', res.data.result);
      return res.data.result;
    })
    .catch((err) => console.log(err));
};
