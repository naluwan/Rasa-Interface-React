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
  actionAddResButtons,
  actionSetRasaTrainState,
} from 'actions';
// import { computed } from 'zustand-middleware-computed-state';
import { Toast } from 'utils/swalInput';
import { cloneDeep } from 'lodash-es';
import { randomBotResAction } from 'utils/randomBotResAction';

const initialState = {
  isAppInitializedComplete: false,
  user: null,
  loading: false,
  stories: [],
  story: {},
  nlu: {},
  config: {},
  domain: {},
  cloneData: { stories: {}, nlu: {}, domain: {} },
  deletedStory: {},
  actions: [],
  storiesOptions: [],
  rasaTrainState: 1,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ALL_TRAIN_DATA': {
      if (action.payload) {
        const { stories, domain, nlu } = action.payload;
        const filteredStories = stories.filter(
          (item) => !item.story.includes('button_'),
        );
        return {
          ...state,
          ...action.payload,
          storiesOptions: filteredStories,
          cloneData: cloneDeep({ stories, nlu, domain }),
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
      const { domain, nlu, stories } = cloneDeep(state.cloneData);
      const story = stories.filter((item) => item.story === action.payload)[0];
      story.steps.map((step) => {
        if (step.action) {
          step.response = JSON.parse(
            JSON.stringify(domain.responses[step.action][0].text).replace(
              / \\n/g,
              '\\r',
            ),
          );

          // ??????????????????
          const botRes = domain.responses[step.action][0];

          // ?????????????????????
          if (botRes.buttons) {
            const buttons = [];
            const buttonStory = [];
            let intent = '';

            // ???????????????????????????
            botRes.buttons.map((button) => {
              intent = button.payload.replace(/\//g, '');
              return stories.map((item) => {
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

            // ??????????????????
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

            // ????????????????????????
            buttons.map((curButton) => {
              curButton.reply =
                domain.responses[curButton.buttonAction][0].text;
              return curButton;
            });

            step.buttons = buttons;
          }
        }
        if (step.intent) {
          const examples = nlu.rasa_nlu_data.common_examples.filter(
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
      const { stories, domain, nlu } = cloneDeep(state.cloneData);

      const newUserSay = newWord.trim();

      nlu.rasa_nlu_data.common_examples.map((nluItem) =>
        nluItem.text === newUserSay ? repeat.push(newUserSay) : nluItem,
      );

      if (repeat.length) {
        return Toast.fire({
          icon: 'warning',
          title: `??????????????????${newUserSay}?????????`,
        });
      }

      // ??????stories???????????????????????????
      stories.map((item) => {
        if (item.story === storyName) {
          item.steps.map((step) => {
            if (step.user === oriWord) {
              step.user = newUserSay;
              step.intent = newUserSay;
            }
            return step;
          });
        }
        return item;
      });

      // ??????nlu???????????????????????????????????????????????????
      nlu.rasa_nlu_data.common_examples.map((nluItem) => {
        if (nluItem.text === oriWord) {
          nluItem.text = newUserSay;
          nluItem.intent = newUserSay;
        }
        if (nluItem.intent === oriWord && nluItem.text !== oriWord) {
          nluItem.intent = newUserSay;
        }
        return nluItem;
      });

      // ??????domain?????????????????????
      const intentIdx = domain.intents.indexOf(oriWord);
      domain.intents.splice(intentIdx, 1, newUserSay);

      // ?????????????????????????????????????????????????????????????????????
      const responses = Object.entries(domain.responses);
      let actionName = '';
      const isInButton = responses.some((response) => {
        return response[1].some((item) => {
          return item.buttons?.some((button) => {
            if (button.title === oriWord) {
              [actionName] = response;
              return true;
            }
            return false;
          });
        });
      });

      // ?????????????????????????????????????????????????????????????????????
      if (isInButton) {
        domain.responses[actionName][0].buttons.map((button) => {
          if (button.title === oriWord) {
            button.title = newUserSay;
            button.payload = `/${newUserSay}`;
          }
          return button;
        });
      }

      const cloneData = {
        stories,
        domain,
        nlu,
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '???????????????????????????',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '???????????????????????????',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'EDIT_BOT_RESPONSE': {
      const { oriWord, newWord, actionName, storyName } = action.payload;
      const { onSetStory, onSetAllTrainData } = state;
      const { domain } = cloneDeep(state.cloneData);
      if (
        state.cloneData.domain.responses[actionName] &&
        state.cloneData.domain.responses[actionName][0].text ===
          JSON.parse(JSON.stringify(oriWord).replace(/ \\n/g, '  \\n'))
      ) {
        domain.responses[actionName][0].text = JSON.parse(
          JSON.stringify(newWord).replace(/\\n/g, '  \\n'),
        );
      }

      const cloneData = {
        ...state.cloneData,
        domain,
      };
      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '???????????????????????????',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '???????????????????????????',
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

      const { nlu } = cloneDeep(state.cloneData);

      const newNlu = nlu.rasa_nlu_data.common_examples.filter(
        (nluItem) => nluItem.intent !== intent || nluItem.text === intent,
      );

      currentExamples.map((example) => {
        return newNlu.map((nluItem) => {
          if (nluItem.text === example) {
            repeat.push(example);
          }
          return nluItem;
        });
      });

      if (repeat.length) {
        return Toast.fire({
          title: '??????????????????',
          text: `${repeat.toString()}`,
          icon: 'warning',
        });
      }

      currentExamples.map((example) =>
        newNlu.push({
          text: example,
          intent,
          entities: [],
        }),
      );

      const cloneData = {
        ...state.cloneData,
        nlu: { rasa_nlu_data: { common_examples: newNlu } },
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '???????????????????????????',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '???????????????????????????',
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

      // ???????????????????????????????????????????????????
      const isButton = cloneData.stories.some((item) => {
        return item.steps.some((step) => {
          if (step.intent === curOriPayload && item.story.includes('button_')) {
            return true;
          }
          return false;
        });
      });

      const currentReply = JSON.parse(
        JSON.stringify(reply).replace(/\\r\\n/g, '  \\n'),
      );

      // ???????????????????????????
      if (title !== curOriPayload) {
        const stories = cloneData.stories.map((item) => {
          // ???stories?????????????????????????????????????????????
          if (isButton) {
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
          } else {
            item.steps.map((step) => {
              if (step.intent === curOriPayload) {
                step.user = title;
                step.intent = title;
              }
              return step;
            });
          }

          return item;
        });

        // ????????????????????????????????????????????????????????????????????????????????????????????????
        cloneData.nlu.rasa_nlu_data.common_examples.map((nluItem, idx) => {
          if (nluItem.text === title && nluItem.intent === curOriPayload) {
            cloneData.nlu.rasa_nlu_data.common_examples.splice(idx, 1);
          }
          return nluItem;
        });

        // ???nlu?????????????????????????????????
        const nlu = {
          rasa_nlu_data: {
            common_examples: cloneData.nlu.rasa_nlu_data.common_examples.map(
              (nluItem) => {
                if (nluItem.intent === curOriPayload) {
                  if (isButton) {
                    nluItem.text = title;
                    nluItem.intent = title;
                  } else {
                    if (nluItem.text === curOriPayload) {
                      nluItem.text = title;
                      nluItem.intent = title;
                    }
                    nluItem.intent = title;
                  }
                }
                return nluItem;
              },
            ),
          },
        };

        // ??????domain????????????
        const { domain } = cloneData;
        domain.responses[actionName][0].buttons.map((button) => {
          if (button.payload === oriPayload) {
            button.title = title;
            button.payload = `${payload}`;
          }
          return button;
        });

        // ???domain????????????intents?????????????????????
        const intentIdx = domain.intents.indexOf(curOriPayload);
        domain.intents.splice(intentIdx, 1, title);

        cloneData.stories = stories;
        cloneData.nlu = nlu;
        cloneData.domain = domain;
      }

      // ???domain????????????responses????????????????????????
      const { domain } = cloneData;

      if (domain.responses[buttonActionName][0].text !== currentReply) {
        domain.responses[buttonActionName][0].text = currentReply;
      }

      cloneData.domain = domain;

      // ???????????????????????????????????????????????????API
      if (
        title !== curOriPayload ||
        state.domain.responses[buttonActionName][0].text !== currentReply
      ) {
        return postAllTrainData(cloneData).then((res) => {
          if (res.status !== 'success') {
            return Toast.fire({
              icon: 'error',
              title: '????????????????????????',
              text: res.message,
            });
          }
          Toast.fire({
            icon: 'success',
            title: '????????????????????????',
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

        cloneData.domain.actions.splice(
          cloneData.domain.actions.indexOf(buttonActionName),
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
            title: '????????????????????????',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '????????????????????????',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'ADD_RES_BUTTONS': {
      const { actionName, title, payload, reply, storyName } = action.payload;
      const { onSetAllTrainData, onSetStory } = state;
      const cloneData = {
        ...state.cloneData,
      };
      const { stories, nlu, domain } = cloneData;
      const intentStory = [];
      stories.map((item) => {
        return item.steps.map((step) =>
          step.intent === title && item.story !== `button_${title}`
            ? intentStory.push(item)
            : step,
        );
      });
      const isExist = stories.some((item) => item.story === `button_${title}`);

      if (intentStory.length) {
        if (domain.responses[actionName][0].buttons) {
          domain.responses[actionName][0].buttons.push({
            title,
            payload,
          });
        } else {
          domain.responses[actionName][0].buttons = [
            {
              title,
              payload,
            },
          ];
        }
        cloneData.domain = domain;
      } else {
        if (isExist) {
          Toast.fire({
            icon: 'warning',
            title: '??????????????????',
          });
        } else {
          const buttonActionName = randomBotResAction(state.actions);
          stories.push({
            story: `button_${title}`,
            steps: [
              { user: title, intent: title, entities: [] },
              { action: buttonActionName },
            ],
          });
          nlu.rasa_nlu_data.common_examples.push({
            text: title,
            intent: title,
            entities: [],
          });

          if (domain.responses[actionName][0].buttons) {
            domain.responses[actionName][0].buttons.push({ title, payload });
          } else {
            domain.responses[actionName][0].buttons = [{ title, payload }];
          }

          domain.actions.push(buttonActionName);
          domain.responses[buttonActionName] = [{ text: reply }];
          domain.intents.push(title);
        }
        cloneData.stories = stories;
        cloneData.nlu = nlu;
        cloneData.domain = domain;
      }

      if (intentStory.length || !isExist) {
        return postAllTrainData(cloneData).then((res) => {
          if (res.status !== 'success') {
            return Toast.fire({
              icon: 'error',
              title: '????????????????????????',
              text: res.message,
            });
          }
          Toast.fire({
            icon: 'success',
            title: '????????????????????????',
          });
          onSetAllTrainData(res.data);
          return onSetStory(storyName);
        });
      }
      return {
        ...state,
      };
    }
    case 'SET_RASA_TRAIN_STATE': {
      return {
        ...state,
        rasaTrainState: action.payload,
      };
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
            title: '????????????',
          });
        }
        return Toast.fire({
          icon: 'error',
          title: '????????????',
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
    onAddResButtons(
      actionName: string,
      title: string,
      payload: string,
      reply: string,
      storyName: string,
    ) {
      dispatch(
        actionAddResButtons(actionName, title, payload, reply, storyName),
      );
    },
    onSetRasaTrainState(state: number) {
      dispatch(actionSetRasaTrainState(state));
    },
  };
});

export default useStoryStore;
