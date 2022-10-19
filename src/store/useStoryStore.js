import create from 'zustand';
import {
  getJWTToken,
  verifyToken,
  cleanToken,
  fetchLogin,
  fetchRegister,
  postAllTrainData,
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
  actionEditUserSay,
  actionEditBotRes,
  actionEditExamples,
  actionSetDeleteStory,
  actionSetAllAction,
  actionEditResButtons,
  actionRemoveResButton,
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
  deletedStory: {},
  actions: [],
  storiesOptions: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ALL_TRAIN_DATA': {
      if (action.payload) {
        const { stories } = action.payload;
        const filteredStories = stories.filter(
          (item) => !item.story.includes('button_'),
        );
        return {
          ...state,
          ...action.payload,
          storiesOptions: filteredStories,
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

          // 獲取回覆資料
          const botRes = state.cloneData.domain.responses[step.action][0];

          // 判斷是否有按鈕
          if (botRes.buttons) {
            const buttons = [];
            const buttonStory = [];
            let intent = '';

            // 將按鈕故事篩選出來
            botRes.buttons.map((button) => {
              intent = button.payload.replace(/\//g, '');
              return state.cloneData.stories.map((item) => {
                if (item.story === `button_${intent}`) {
                  buttonStory.push(item);
                } else {
                  item.steps.map((buttonStep) => {
                    if (buttonStep.intent) {
                      if (buttonStep.intent === intent) {
                        item.intentStory = true;
                        buttonStory.push(item);
                      }
                    }
                    return buttonStep;
                  });
                }
                return item;
              });
            });

            // 重組按鈕資料
            buttonStory.map((item) => {
              const button = {};
              item.steps.map((itemStep) => {
                if (item.intentStory) {
                  button.disabled = true;
                }
                if (itemStep.action) {
                  button.buttonAction = itemStep.action;
                }
                if (itemStep.intent) {
                  button.title = itemStep.intent;
                  button.payload = itemStep.intent;
                }
                return itemStep;
              });
              delete item.intentStory;
              return buttons.push(button);
            });

            // 獲取按鈕回覆文字
            buttons.map((curButton) => {
              curButton.reply =
                state.cloneData.domain.responses[
                  curButton.buttonAction
                ][0].text;
              return curButton;
            });

            step.buttons = buttons;
          }
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

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '編輯使用者對話失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '編輯使用者對話成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
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
      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '編輯機器人回覆失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '編輯機器人回覆成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'EDIT_EXAMPLES': {
      const { intent, examples, storyName } = action.payload;
      const { onSetStory, onSetAllTrainData } = state;
      const currentExamples = examples
        .split(',')
        .map((example) => example.trimStart())
        .map((example) => example.trimEnd())
        .filter((example) => example !== '');
      const repeat = [];

      const nlu = state.cloneData.nlu.rasa_nlu_data.common_examples.filter(
        (nluItem) => nluItem.intent !== intent || nluItem.text === intent,
      );

      currentExamples.map((example) => {
        return nlu.map((nluItem) => {
          if (nluItem.text === example) {
            repeat.push(example);
          }
          return nluItem;
        });
      });

      if (repeat.length) {
        return Toast.fire({
          title: '以下例句重複',
          text: `${repeat.toString()}`,
          icon: 'warning',
        });
      }

      currentExamples.map((example) =>
        nlu.push({
          text: example,
          intent,
          entities: [],
        }),
      );

      const cloneData = {
        ...state.cloneData,
        nlu: { rasa_nlu_data: { common_examples: nlu } },
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '編輯使用者例句失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '編輯使用者例句成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'SET_DELETE_STORY': {
      return {
        ...state,
        deletedStory: action.payload,
      };
    }
    case 'SET_ALL_ACTION': {
      return {
        ...state,
        actions: action.payload,
      };
    }
    case 'EDIT_RES_BUTTONS': {
      const {
        actionName,
        title,
        oriPayload,
        payload,
        reply,
        storyName,
        buttonActionName,
      } = action.payload;

      const { onSetAllTrainData, onSetStory } = state;
      const curOriPayload = oriPayload.replace(/\//g, '');

      const cloneData = {
        ...state.cloneData,
      };

      // 如果按鈕標題有更改
      if (title !== curOriPayload) {
        const stories = state.cloneData.stories.map((item) => {
          // 將stories訓練檔中按鈕故事更改意圖與對話
          if (item.story === `button_${curOriPayload}`) {
            item.story = `button_${title}`;
            item.steps.map((step) => {
              if (step.intent) {
                step.user = title;
                step.intent = title;
              }
              return step;
            });
          }
          return item;
        });

        // 將nlu訓練檔中的按鈕例句更改
        const nlu = {
          rasa_nlu_data: {
            common_examples:
              state.cloneData.nlu.rasa_nlu_data.common_examples.map(
                (nluItem) => {
                  if (nluItem.intent === curOriPayload) {
                    nluItem.text = title;
                    nluItem.intent = title;
                  }
                  return nluItem;
                },
              ),
          },
        };

        // 將domain訓練檔中responses的按鈕標題和payload更改
        const { domain } = state.cloneData;

        domain.responses[actionName][0].buttons.map((button) => {
          if (button.payload === oriPayload) {
            button.title = title;
            button.payload = `${payload}`;
          }
          return button;
        });

        // 將domain訓練檔中intents的按鈕意圖更改
        const intentIdx = domain.intents.indexOf(curOriPayload);
        domain.intents.splice(intentIdx, 1, title);

        cloneData.stories = stories;
        cloneData.nlu = nlu;
        cloneData.domain = domain;
      }

      const currentReply = JSON.parse(
        JSON.stringify(reply).replace(/\\r\\n/g, '  \\n'),
      );

      // 將domain訓練檔中responses的按鈕回覆做更改
      const { domain } = cloneData;
      if (domain.responses[buttonActionName][0].text !== currentReply) {
        domain.responses[buttonActionName][0].text = currentReply;
      }

      cloneData.domain = domain;

      // 如果有按鈕標題或回覆內容有更改才送API
      if (
        title !== curOriPayload ||
        state.domain.responses[buttonActionName][0].text !== currentReply
      ) {
        return postAllTrainData(cloneData).then((res) => {
          if (res.status !== 'success') {
            return Toast.fire({
              icon: 'error',
              title: '編輯按鈕選項失敗',
              text: res.message,
            });
          }
          Toast.fire({
            icon: 'success',
            title: '編輯按鈕選項成功',
          });
          onSetAllTrainData(res.data);
          return onSetStory(storyName);
        });
      }
      return {
        ...state,
      };
    }
    case 'REMOVE_RES_BUTTON': {
      const { actionName, payload, storyName, buttonActionName, disabled } =
        action.payload;

      const { onSetAllTrainData, onSetStory } = state;

      const cloneData = {
        ...state.cloneData,
      };

      if (!disabled) {
        const storyNames = cloneData.stories.map((item) => item.story);
        cloneData.stories.splice(storyNames.indexOf(`button_${payload}`), 1);

        const nluItems = cloneData.nlu.rasa_nlu_data.common_examples.map(
          (nluItem) => nluItem.text,
        );
        cloneData.nlu.rasa_nlu_data.common_examples.splice(
          nluItems.indexOf(payload),
          1,
        );

        delete cloneData.domain.responses[buttonActionName];

        const buttonTexts = cloneData.domain.responses[
          actionName
        ][0].buttons.map((button) => button.title);

        cloneData.domain.responses[actionName][0].buttons.splice(
          buttonTexts.indexOf(payload),
          1,
        );

        cloneData.domain.intents.splice(
          cloneData.domain.intents.indexOf(payload),
          1,
        );
      } else {
        const buttonTexts = cloneData.domain.responses[
          actionName
        ][0].buttons.map((button) => button.title);

        cloneData.domain.responses[actionName][0].buttons.splice(
          buttonTexts.indexOf(payload),
          1,
        );
      }

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '刪除按鈕選項失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '刪除按鈕選項成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
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
    onEditExamples(intent: string, examples: string, storyName: string) {
      dispatch(actionEditExamples(intent, examples, storyName));
    },
    onSetDeleteStory(deleteStory: StoryType) {
      dispatch(actionSetDeleteStory(deleteStory));
    },
    onSetAllAction(action: string[]) {
      dispatch(actionSetAllAction(action));
    },
    onEditResButtons(
      actionName: string,
      title: string,
      oriPayload: string,
      payload: string,
      reply: string,
      storyName: string,
      buttonActionName: string,
    ) {
      dispatch(
        actionEditResButtons(
          actionName,
          title,
          oriPayload,
          payload,
          reply,
          storyName,
          buttonActionName,
        ),
      );
    },
    onRemoveResButton(
      actionName: string,
      payload: string,
      storyName: string,
      buttonActionName: string,
      disabled: boolean,
    ) {
      dispatch(
        actionRemoveResButton(
          actionName,
          payload,
          storyName,
          buttonActionName,
          disabled,
        ),
      );
    },
  };
});

export default useStoryStore;
