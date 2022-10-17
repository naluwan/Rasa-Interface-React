import create from 'zustand';
import {
  getJWTToken,
  verifyToken,
  cleanToken,
  fetchLogin,
  fetchRegister,
  postTrainData,
} from 'services/api';
import type {
  RegisterUserInfoType,
  TrainDataType,
  State,
  StoryType,
} from 'components/types';

import type { Action } from 'actions';
import {
  actionSetAllData,
  actionSetStory,
  actionCreateNewStory,
  actionEditUserSay,
  actionEditBotRes,
} from 'actions';
// import { computed } from 'zustand-middleware-computed-state';
import { Toast } from 'utils/swalInput';
import { cloneDeep } from 'lodash-es';

const initialState = {
  isAppInitializedComplete: false,
  user: null,
  loading: false,
  stories: [],
  story: {},
  nlu: {},
  domain: {},
  cloneData: { stories: {}, nlu: {}, domain: {} },
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ALL_TRAIN_DATA': {
      if (action.payload) {
        return {
          ...state,
          ...action.payload,
          cloneData: cloneDeep(action.payload),
        };
      }
      return {
        ...state,
      };
    }
    case 'SET_STORY': {
      if (!action.payload) {
        return {
          ...state,
          story: {},
        };
      }
      const story = state.stories.filter(
        (item) => item.story === action.payload,
      )[0];
      story.steps.map((step) => {
        if (step.action) {
          step.response = JSON.parse(
            JSON.stringify(state.domain.responses[step.action][0].text).replace(
              / \\n/g,
              '\\r',
            ),
          );
        }
        if (step.intent) {
          const examples = state.nlu.rasa_nlu_data.common_examples.filter(
            (nluItem) =>
              nluItem.intent === step.intent && nluItem.text !== step.intent,
          );

          const currentExample = examples.map((example) => example.text);
          step.examples = currentExample;
        }
        return step;
      });
      return {
        ...state,
        story,
      };
    }
    case 'CREATE_NEW_STORY': {
      const newStory = action.payload;
      const userStep = [];
      const botStep = [];
      const { cloneData } = state;
      // 驗證步驟是否正確
      newStory.steps.map((step) =>
        step.intent ? userStep.push(step) : botStep.push(step),
      );
      if (userStep.length === 0) {
        return Toast.fire({
          icon: 'warning',
          title: '使用者對話是必填的',
        });
      }
      if (botStep.length === 0) {
        return Toast.fire({
          icon: 'warning',
          title: '機器人回覆是必填的',
        });
      }
      // 組成例句的訓練檔格式
      const currentExamples = newStory.steps
        .filter((step) => step.examples)
        .map((step) => ({ intent: step.intent, examples: step.examples }));

      // 將例句訓練檔放進nlu訓練檔中
      // 將意圖放進domain訓練檔的intents中
      currentExamples.map((exampleItem) => {
        return exampleItem.examples.map((example) => {
          return cloneData.nlu.rasa_nlu_data.common_examples.push({
            text: example,
            intent: exampleItem.intent,
            entities: [],
          });
        });
      });

      // 組成機器人回覆的訓練檔格式
      const currentAction = newStory.steps
        .filter((step) => step.action)
        .map((step) => ({
          action: step.action,
          text: step.response,
        }));

      // 將機器人回覆放進domain訓練檔中
      currentAction.map((actionItem) => {
        cloneData.domain.responses[actionItem.action] = [
          { text: actionItem.text },
        ];
        return cloneData.domain.actions.push(actionItem.action);
      });

      // 在完成儲存動作之前還需要newStory，所以需要深層複製，否則後面某些物件資料後，會有問題
      const cloneNewStory = cloneDeep(newStory);

      // 組成故事流程的訓練檔格式
      cloneNewStory.steps = cloneNewStory.steps.map((step) => {
        if (step.intent) {
          delete step.examples;
        }
        if (step.action) {
          delete step.response;
        }
        return step;
      });

      cloneData.stories.push(cloneNewStory);

      // 將使用者對話加入nlu和domain訓練檔中
      cloneNewStory.steps.map((step) => {
        if (step.intent) {
          cloneData.nlu.rasa_nlu_data.common_examples.push({
            text: step.user,
            intent: step.intent,
            entities: [],
          });
          cloneData.domain.intents.push(step.intent);
        }
        return step;
      });
      return {
        ...state,
        cloneData,
      };
    }
    case 'EDIT_USER_SAY': {
      const repeat = [];
      const { onSetAllTrainData, onSetStory } = state;
      const { oriWord, newWord, storyName } = action.payload;
      state.cloneData.nlu.rasa_nlu_data.common_examples.map((nluItem) =>
        nluItem.text === newWord ? repeat.push(newWord) : nluItem,
      );

      if (repeat.length) {
        return Toast.fire({
          icon: 'warning',
          title: `使用者對話『${newWord}』重複`,
        });
      }

      // 更改stories訓練檔的使用者對話
      const stories = state.cloneData.stories.map((item) => {
        if (item.story === storyName) {
          item.steps.map((step) => {
            if (step.user === oriWord) {
              step.user = newWord;
              step.intent = newWord;
            }
            return step;
          });
        }
        return item;
      });

      // 更改nlu訓練檔中所有意圖與原意圖相同的例句
      const nlu = {
        rasa_nlu_data: {
          common_examples:
            state.cloneData.nlu.rasa_nlu_data.common_examples.map((nluItem) => {
              if (nluItem.text === oriWord) {
                nluItem.text = newWord;
                nluItem.intent = newWord;
              }
              if (nluItem.intent === oriWord && nluItem.text !== oriWord) {
                nluItem.intent = newWord;
              }
              return nluItem;
            }),
        },
      };

      // 更改domain訓練檔中的意圖
      const intentIdx = state.cloneData.domain.intents.indexOf(oriWord);
      const domain = {
        ...state.cloneData.domain,
        intents: state.cloneData.domain.intents.splice(intentIdx, 1, newWord),
      };

      const cloneData = {
        ...state.cloneData,
        domain,
        nlu,
        stories,
      };

      return postTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '編輯失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '編輯使用者對話成功',
        });
        onSetAllTrainData(res.data);
        onSetStory(storyName);
        return {
          ...state,
        };
      });
    }
    case 'EDIT_BOT_RESPONSE': {
      const { oriWord, newWord, actionName, storyName } = action.payload;
      const { onSetStory, onSetAllTrainData } = state;
      const { domain } = state.cloneData;
      if (
        state.cloneData.domain.responses[actionName] &&
        state.cloneData.domain.responses[actionName][0].text === oriWord
      ) {
        domain.responses[actionName][0].text = newWord;
      }

      const cloneData = {
        ...state.cloneData,
        domain,
      };
      return postTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '編輯失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '編輯機器人回覆成功',
        });
        onSetAllTrainData(res.data);
        onSetStory(storyName);
        return {
          ...state,
        };
      });
    }
    default:
      return state;
  }
};

const useStoryStore = create((set) => {
  const dispatch = (action: Action) => {
    set((state) => {
      return reducer(state, action);
    });
  };
  return {
    ...initialState,
    dispatch,
    // --------------------------- Action
    init() {
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
      fetchLogin(email, password).then((res) => {
        if (res.status === 'success') {
          set({ user: res.user, loading: false });
          return Toast.fire({
            icon: 'success',
            title: '登入成功',
          });
        }
        return Toast.fire({
          icon: 'error',
          title: '登入失敗',
          text: res.message,
        });
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
    onSetAllTrainData(data: TrainDataType) {
      dispatch(actionSetAllData(data));
    },
    onSetStory(storyName: string) {
      dispatch(actionSetStory(storyName));
    },
    onCreateNewStory(newStory: StoryType) {
      dispatch(actionCreateNewStory(newStory));
    },
    onEditUserSay(oriWord: string, newWord: string, storyName: string) {
      dispatch(actionEditUserSay(oriWord, newWord, storyName));
    },
    onEditBotRes(
      oreWord: string,
      newWord: string,
      actionName: string,
      storyName: string,
    ) {
      dispatch(actionEditBotRes(oreWord, newWord, actionName, storyName));
    },
  };
});

export default useStoryStore;
