import create from 'zustand';
import {
  getJWTToken,
  verifyToken,
  cleanToken,
  fetchLogin,
  fetchRegister,
} from 'services/api';
import { RegisterUserInfoType } from 'components/types';
// import { computed } from 'zustand-middleware-computed-state';
import type { StoryType } from 'components/types';

const initialState = {
  isAppInitializedComplete: false,
  user: null,
  loading: false,
  stories: [],
  story: {},
};

const useStoryStore = create((set, get) => {
  return {
    ...initialState,
    // --------------------------- Action
    init() {
      console.log('init');
      const token = getJWTToken();
      if (token) {
        verifyToken(token)
          .then((user) => {
            set({ user, isAppInitializedComplete: true });
          })
          .catch(() => {});
      } else {
        set({ isAppInitializedComplete: true });
      }
    },
    onLogin(email: string, password: string) {
      set({ loading: true });
      return fetchLogin(email, password).then((res) => {
        set({ user: res.user, loading: false });
        return res;
      });
    },
    onLogout() {
      cleanToken();
      window.location.reload();
    },
    onRegister(userInfo: RegisterUserInfoType) {
      set({ loading: true });
      return fetchRegister(userInfo)
        .then((res) => {
          set({ loading: false });
          return res;
        })
        .catch((err) => console.log(err));
    },
    setStory(storyName: string) {
      const story = get().stories.filter((item) => item.story === storyName)[0];
      set({ story });
    },
    setStories(stories: StoryType[]) {
      set({ stories });
    },
  };
});

export default useStoryStore;
