import create from 'zustand';
import { getJWTToken, verifyToken, fetchLogin, cleanToken } from 'services/api';

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
  };
});

export default useUserStore;
