import create from 'zustand';
import {
  getJWTToken,
  verifyToken,
  cleanToken,
  fetchLogin,
  fetchRegister,
} from 'services/api';

const initialState = {
  isAppInitializedComplete: false,
  user: null,
  loading: false,
};

const useUserStore = create((set) => {
  return {
    ...initialState,
    // --------------------------- Action
    init() {
      console.log('init');
      const token = getJWTToken();
      if (token) {
        verifyToken(token)
          .then((res) => {
            set({ user: res.user });
          })
          .catch(() => {})
          .finally(() => {
            set({ isAppInitializedComplete: true });
          });
      } else {
        set({ isAppInitializedComplete: true });
      }
    },
    onLogin(email: string, password: string) {
      set({ loading: true });
      return fetchLogin(email, password)
        .then((res) => {
          set({ user: res.user });
          return res;
        })
        .finally((res) => {
          set({ loading: false });
          return res;
        });
    },
    onLogout() {
      cleanToken();
      window.location.reload();
    },
    onRegister(
      cpnyId: string,
      cpnyName: string,
      chatbotName: string,
      email: string,
      password: string,
      passwordCheck: string,
      image: file,
    ) {
      set({ loading: true });
      return fetchRegister(
        cpnyId,
        cpnyName,
        chatbotName,
        email,
        password,
        passwordCheck,
        image,
      )
        .then((res) => {
          console.log('onRegister:', res);
        })
        .catch((err) => console.log(err));
    },
  };
});

export default useUserStore;
