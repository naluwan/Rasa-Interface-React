import create from 'zustand';
import {
  getJWTToken,
  verifyToken,
  cleanToken,
  fetchLogin,
  fetchRegister,
  postAllTrainData,
  fetchRasaTrainState,
  postTrainDataToRasa,
  loadedNewModel,
} from 'services/api';
import type {
  RegisterUserInfoType,
  TrainDataType,
  State,
  StoryType,
  ApiTrainDataType,
  NluEntitiesType,
} from 'components/types';

import type { Action } from 'actions';
import {
  actionSetAllData,
  actionSetStory,
  actionEditUserSay,
  actionEditBotRes,
  actionCreateExample,
  actionSetDeleteStory,
  actionSetAllAction,
  actionEditResButtons,
  actionRemoveResButton,
  actionAddResButtons,
  actionSetRasaTrainState,
  actionEditIntent,
  actionCreateEntities,
  actionDeleteEntities,
  actionEditEntityShowValue,
  actionEditEntity,
  actionEditEntityValue,
  actionDeleteExample,
  actionCreateSlot,
  actionRemoveSlot,
  actionAddSlotValue,
  actionRemoveSlotValue,
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
  currentPage: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ALL_TRAIN_DATA': {
      if (action.payload) {
        const { stories, domain, nlu } = action.payload;
        const filteredStories = stories.filter(
          (item) =>
            !item.story.includes('button_') && !item.steps[0].checkpoint,
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
      const storyName = action.payload;
      if (!storyName) {
        return {
          ...state,
          story: {},
        };
      }
      const { domain, nlu, stories } = cloneDeep(state.cloneData);
      const story = stories.filter((item) => item.story === storyName)[0];
      story.steps.map((step) => {
        if (step.action) {
          step.response = JSON.parse(
            JSON.stringify(domain.responses[step.action][0].text).replace(
              / \\n/g,
              '\\r',
            ),
          );

          // 獲取回覆資料
          const botRes = domain.responses[step.action][0];

          // 判斷是否有按鈕
          if (botRes.buttons) {
            const buttons = [];
            const buttonStory = [];
            let intent = '';

            // 將按鈕故事篩選出來
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
              curButton.reply = JSON.parse(
                JSON.stringify(
                  domain.responses[curButton.buttonAction][0].text,
                ).replace(/ \\n/g, '\\r'),
              );
              return curButton;
            });

            step.buttons = buttons;
          }
        }
        if (step.intent) {
          const examples = nlu.rasa_nlu_data.common_examples.filter(
            (nluItem) =>
              nluItem.intent === step.intent && nluItem.text !== step.user,
          );

          // const currentExample = examples.map((example) => example.text);
          step.examples = examples;
        }

        // 重組支線故事資料
        if (step.checkpoint) {
          const branchStories = [];
          // 篩選出支線故事
          stories.map((item) => {
            return item.steps.map((branchStep) => {
              if (
                item.story !== storyName &&
                branchStep.checkpoint === step.checkpoint
              ) {
                branchStories.push(item);
              }
              return branchStep;
            });
          });

          // 重組支線故事的機器人回覆
          branchStories.map((branchStory) => {
            return branchStory.steps.map((branchStep, idx) => {
              if (branchStep.action) {
                branchStep.response = JSON.parse(
                  JSON.stringify(
                    domain.responses[branchStep.action][0].text,
                  ).replace(/ \\n/g, '\\r'),
                );

                // 獲取回覆資料
                const botRes = domain.responses[branchStep.action][0];

                // 判斷是否有按鈕
                if (botRes.buttons) {
                  const buttons = [];
                  const buttonStory = [];
                  let intent = '';

                  // 將按鈕故事篩選出來
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
                    curButton.reply = JSON.parse(
                      JSON.stringify(
                        domain.responses[curButton.buttonAction][0].text,
                      ).replace(/ \\n/g, '\\r'),
                    );
                    return curButton;
                  });

                  branchStep.buttons = buttons;
                }
              }
              if (idx !== 0 && branchStep.checkpoint) {
                const connectBranchStories = [];
                stories.map((item) => {
                  return item.steps.map((connectStep, connectStepIdx) => {
                    if (
                      connectStepIdx !== 2 &&
                      connectStep.checkpoint === branchStep.checkpoint
                    ) {
                      connectBranchStories.push(item);
                    }
                    return connectStep;
                  });
                });

                connectBranchStories.map((currentConnectStory) => {
                  return currentConnectStory.steps.map((connectStep) => {
                    if (connectStep.action) {
                      connectStep.response = JSON.parse(
                        JSON.stringify(
                          domain.responses[connectStep.action][0].text,
                        ).replace(/ \\n/g, '\\r'),
                      );

                      // 獲取回覆資料
                      const botRes = domain.responses[branchStep.action][0];

                      // 判斷是否有按鈕
                      if (botRes.buttons) {
                        const buttons = [];
                        const buttonStory = [];
                        let intent = '';

                        // 將按鈕故事篩選出來
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
                          curButton.reply = JSON.parse(
                            JSON.stringify(
                              domain.responses[curButton.buttonAction][0].text,
                            ).replace(/ \\n/g, '\\r'),
                          );
                          return curButton;
                        });

                        branchStep.buttons = buttons;
                      }
                    }
                    return connectStep;
                  });
                });

                branchStep.branchStories = connectBranchStories;
              }
              return branchStep;
            });
          });

          step.branchStories = branchStories;
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
          title: `使用者對話『${newUserSay}』重複`,
        });
      }

      // 更改stories訓練檔的使用者對話
      stories.map((item) => {
        if (item.story === storyName) {
          item.steps.map((step) => {
            if (step.user === oriWord) {
              step.user = newUserSay;
              // step.intent = newUserSay;
            }
            return step;
          });
        }
        return item;
      });

      // 更改nlu訓練檔中所有意圖與原意圖相同的例句
      nlu.rasa_nlu_data.common_examples.map((nluItem) => {
        if (nluItem.text === oriWord) {
          nluItem.text = newUserSay;
          // nluItem.intent = newUserSay;
        }
        // if (nluItem.intent === oriWord && nluItem.text !== oriWord) {
        //   nluItem.intent = newUserSay;
        // }
        return nluItem;
      });

      // 更改domain訓練檔中的意圖
      // const intentIdx = domain.intents.indexOf(oriWord);
      // domain.intents.splice(intentIdx, 1, newUserSay);

      // 確認目前故事流程中所有的按鈕是否有串接到此故事
      // const responses = Object.entries(domain.responses);
      // let actionName = '';
      // const isInButton = responses.some((response) => {
      //   return response[1].some((item) => {
      //     return item.buttons?.some((button) => {
      //       if (button.title === oriWord) {
      //         [actionName] = response;
      //         return true;
      //       }
      //       return false;
      //     });
      //   });
      // });

      // 如果按鈕有串接到此故事，就把按鈕資料也一起更改
      // if (isInButton) {
      //   domain.responses[actionName][0].buttons.map((button) => {
      //     if (button.title === oriWord) {
      //       button.title = newUserSay;
      //       button.payload = `/${newUserSay}`;
      //     }
      //     return button;
      //   });
      // }

      const cloneData = {
        stories,
        domain,
        nlu,
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
    case 'CREATE_EXAMPLE': {
      const { stepIntent, example, exampleEntities, storyName } =
        action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetStory, onSetAllTrainData } = state;
      const currentExamples = example.trimStart().trimEnd();
      const repeat = [];

      // 驗證例句是否重複
      nlu.rasa_nlu_data.common_examples.map((nluItem) =>
        nluItem.text === currentExamples
          ? repeat.push(currentExamples)
          : nluItem,
      );

      // 例句重複處理
      if (repeat.length) {
        return Toast.fire({
          title: '以下例句重複',
          text: `${repeat.toString()}`,
          icon: 'warning',
        });
      }

      // 添加例句
      nlu.rasa_nlu_data.common_examples.push({
        text: currentExamples,
        intent: stepIntent,
        entities: exampleEntities,
      });

      const cloneData = {
        stories,
        nlu,
        domain,
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

      const isRepeat = cloneData.domain.intents.includes(title);

      if (isRepeat && title !== curOriPayload) {
        return Toast.fire({
          icon: 'warning',
          title: `意圖『${title}』重複`,
        });
      }

      // 驗證是否是新建按鈕或是串接別的故事
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

      // 如果按鈕標題有更改
      if (title !== curOriPayload) {
        const stories = cloneData.stories.map((item) => {
          // 將stories訓練檔中按鈕故事更改意圖與對話
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
                // step.user = title;
                step.intent = title;
              }
              return step;
            });
          }

          return item;
        });

        /* 因為啟用意圖功能，不會再修改到使用者對話，所以不會再有修改到重覆例句的問題
        // 判斷更新的按鈕例句是否已經存在，如果存在就先刪除在更新原本的例句
        // cloneData.nlu.rasa_nlu_data.common_examples.map((nluItem, idx) => {
        //   if (nluItem.text === title && nluItem.intent === curOriPayload) {
        //     cloneData.nlu.rasa_nlu_data.common_examples.splice(idx, 1);
        //   }
        //   return nluItem;
        // });
        */

        // 將nlu訓練檔中的按鈕例句更改
        const nlu = {
          rasa_nlu_data: {
            common_examples: cloneData.nlu.rasa_nlu_data.common_examples.map(
              (nluItem) => {
                if (nluItem.intent === curOriPayload) {
                  if (isButton) {
                    nluItem.text = title;
                    nluItem.intent = title;
                  } else {
                    /* 啟用意圖功能後，此段可註解
                    if (nluItem.text === curOriPayload) {
                      nluItem.text = title;
                      nluItem.intent = title;
                    }
                    // */
                    nluItem.intent = title;
                  }
                }
                return nluItem;
              },
            ),
          },
        };

        // 更改domain按鈕內容
        const { domain } = cloneData;
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
            title: '此按鈕已存在',
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
              title: '新增按鈕選項失敗',
              text: res.message,
            });
          }
          Toast.fire({
            icon: 'success',
            title: '新增按鈕選項成功',
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
    case 'EDIT_INTENT': {
      const { oriIntent, intent, storyName } = action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetStory, onSetAllTrainData } = state;
      // 驗證意圖是否重複
      const isRepeat = domain.intents.includes(intent);
      if (isRepeat) {
        return Toast.fire({
          icon: 'warning',
          title: `意圖『${intent}』重複`,
        });
      }

      // 更新stories該故事意圖
      stories.map((item) => {
        if (item.story === storyName) {
          item.steps.map((step) => {
            if (step.intent === oriIntent) {
              step.intent = intent;
            }
            return step;
          });
        }
        return item;
      });

      // 將nlu訓練檔內的意圖更新
      nlu.rasa_nlu_data.common_examples.map((nluItem) => {
        if (nluItem.intent === oriIntent) {
          nluItem.intent = intent;
        }
        return nluItem;
      });

      // 更新domain訓練檔內的intents，刪除就的意圖，新增新的意圖
      domain.intents.splice(domain.intents.indexOf(oriIntent), 1, intent);

      // 確認目前故事流程中所有的按鈕是否有串接到此故事
      const responses = Object.entries(domain.responses);
      let actionName = '';
      const isInButton = responses.some((response) => {
        return response[1].some((item) => {
          return item.buttons?.some((button) => {
            if (button.title === oriIntent) {
              [actionName] = response;
              return true;
            }
            return false;
          });
        });
      });

      // 如果按鈕有串接到此故事，就把按鈕資料也一起更改
      if (isInButton) {
        domain.responses[actionName][0].buttons.map((button) => {
          if (button.title === oriIntent) {
            button.title = intent;
            button.payload = `/${intent}`;
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
            title: '編輯意圖失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '編輯意圖成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'CREATE_ENTITIES': {
      const { entities, intent, storyName } = action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetStory, onSetAllTrainData } = state;

      let userSay = '';
      stories.map((item) => {
        if (item.story === storyName) {
          item.steps.map((step) => {
            if (step.intent === intent) {
              userSay = step.user;
              step.entities.push({ [entities.entity]: entities.value });
            }
            return step;
          });
        }
        return item;
      });

      nlu.rasa_nlu_data.common_examples.map((nluItem) => {
        if (nluItem.text === userSay && nluItem.intent === intent) {
          nluItem.entities.push(entities);
        }
        return nluItem;
      });

      if (!domain.entities.includes(entities.entity)) {
        domain.entities.push(entities.entity);
      }

      const cloneData = {
        stories,
        nlu,
        domain,
      };
      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '新增關鍵字失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '新增關鍵字成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'DELETE_ENTITIES': {
      const { entity, intent, storyName } = action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetStory, onSetAllTrainData } = state;

      let userSay = '';
      let isExist = false;
      // 故事流程
      stories.map((item) => {
        if (item.story === storyName) {
          // 刪除該故事的關鍵字
          item.steps.map((step) => {
            if (step.intent === intent && step.entities.length) {
              userSay = step.user;
              const entitiesKeys = step.entities.map(
                (entityItem) => Object.keys(entityItem)[0],
              );
              step.entities.splice(entitiesKeys.indexOf(entity), 1);
            }
            return step;
          });
        } else {
          // 驗證其他故事流程是否還有用到此關鍵字
          item.steps.map((step) => {
            if (step.intent && step.entities.length) {
              const entitiesKeys = step.entities.map(
                (entityItem) => Object.keys(entityItem)[0],
              );
              isExist = entitiesKeys.includes(entity);
            }
            return step;
          });
        }
        return item;
      });

      nlu.rasa_nlu_data.common_examples.map((nluItem) => {
        if (nluItem.text === userSay && nluItem.intent === intent) {
          const entitiesKeys = nluItem.entities.map(
            (entityItem) => entityItem.entity,
          );
          nluItem.entities.splice(entitiesKeys.indexOf(entity), 1);
        } else if (nluItem.entities.length) {
          const entitiesKeys = nluItem.entities.map(
            (entityItem) => entityItem.entity,
          );
          isExist = entitiesKeys.includes(entity);
        }
        return nluItem;
      });
      if (!isExist) {
        domain.entities.splice(domain.entities.indexOf(entity), 1);
      }

      const cloneData = {
        stories,
        nlu,
        domain,
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '刪除關鍵字失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '刪除關鍵字成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'EDIT_ENTITY_SHOW_VALUE': {
      const { stepIntent, currentEntityValue, newEntityShowValue, storyName } =
        action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetStory, onSetAllTrainData } = state;
      // 驗證關鍵字是否有效
      let userSay;
      const isValidEntityValue = stories.some((item) => {
        if (item.story === storyName) {
          return item.steps.some((step) => {
            if (step.intent && step.intent === stepIntent) {
              userSay = step.user;
              return step.user.includes(newEntityShowValue);
            }
            return false;
          });
        }
        return false;
      });
      if (!isValidEntityValue) {
        return Toast.fire({
          icon: 'warning',
          title: '請填入正確的關鍵字',
        });
      }

      // 驗證關鍵字是否重疊
      const isRepeat = nlu.rasa_nlu_data.common_examples.some((nluItem) => {
        if (nluItem.intent === stepIntent && nluItem.text === userSay) {
          return nluItem.entities.some((entityItem) => {
            if (entityItem.value !== currentEntityValue) {
              const entityItemStart = entityItem.start;
              const entityItemEnd = entityItem.end;
              const newEntityShowValueStart =
                userSay.indexOf(newEntityShowValue);
              const newEntityShowValueEnd =
                newEntityShowValueStart + newEntityShowValue.length;
              if (
                (entityItemStart <= newEntityShowValueStart &&
                  newEntityShowValueStart < entityItemEnd) ||
                (entityItemStart < newEntityShowValueEnd &&
                  newEntityShowValueEnd <= entityItemEnd)
              ) {
                return true;
              }
              return false;
            }
            return false;
          });
        }
        return false;
      });

      // 關鍵字重疊處理
      if (isRepeat) {
        return Toast.fire({
          icon: 'warning',
          title: '關鍵字不可重疊',
        });
      }

      // 更新nlu中該例句的關鍵字
      nlu.rasa_nlu_data.common_examples.map((nluItem) => {
        if (nluItem.intent === stepIntent && nluItem.text === userSay) {
          nluItem.entities.map((entityItem) => {
            if (entityItem.value === currentEntityValue) {
              entityItem.start = userSay.indexOf(newEntityShowValue);
              entityItem.end =
                userSay.indexOf(newEntityShowValue) + newEntityShowValue.length;
              // entityItem.value = newEntityValue;
            }
            return entityItem;
          });
        }
        return nluItem;
      });

      const cloneData = {
        stories,
        nlu,
        domain,
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '編輯關鍵字失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '編輯關鍵字成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'EDIT_ENTITY': {
      const { stepIntent, oriEntity, newEntity, storyName } = action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetStory, onSetAllTrainData } = state;

      // 驗證關鍵字代表值是否有數字
      const regex = /^[0-9]*$/g;

      // 關鍵字代表值有數字
      if (regex.test(newEntity)) {
        return Toast.fire({
          icon: 'warning',
          title: '關鍵字代表值不可為純數字',
        });
      }

      // 驗證同個對話內是否有相同的關鍵字代表值
      const isRepeat = stories.some((item) => {
        if (item.story === storyName) {
          return item.steps.some((step) => {
            if (step.intent && step.intent === stepIntent) {
              return step.entities.some((entityItem) => {
                if (Object.keys(entityItem)[0] !== oriEntity) {
                  return Object.keys(entityItem)[0] === newEntity;
                }
                return false;
              });
            }
            return false;
          });
        }
        return false;
      });

      if (isRepeat) {
        return Toast.fire({
          icon: 'warning',
          title: '同一個對話內關鍵字代表值不可重複',
        });
      }

      let userSay = '';
      // 更改stories訓練檔中該故事該關鍵字的代表值
      stories.map((item) => {
        if (item.story === storyName) {
          item.steps.map((step) => {
            if (step.intent && step.intent === stepIntent) {
              userSay = step.user;
              step.entities = step.entities.map((entityItem) => {
                if (Object.keys(entityItem)[0] === oriEntity) {
                  return {
                    [newEntity]: entityItem[Object.keys(entityItem)[0]],
                  };
                }
                return entityItem;
              });
            }
            return step;
          });
        }
        return item;
      });

      // 更改nlu訓練檔中該例句的關鍵字代表值
      nlu.rasa_nlu_data.common_examples.map((nluItem) => {
        if (nluItem.intent === stepIntent && nluItem.text === userSay) {
          nluItem.entities.map((entityItem) => {
            if (entityItem.entity === oriEntity) {
              entityItem.entity = newEntity;
            }
            return entityItem;
          });
        }
        return nluItem;
      });

      // 確認關鍵字代表值是否還有存在其他故事中
      let isExist = false;
      isExist = stories.some((item) => {
        return item.steps.some((step) => {
          if (step.intent && step.entities.length) {
            return step.entities.some((entityItem) => {
              if (Object.keys(entityItem)[0] === oriEntity) {
                return true;
              }
              return false;
            });
          }
          return false;
        });
      });

      // 更改domain
      if (isExist) {
        if (!domain.entities.includes(newEntity)) {
          domain.entities.push(newEntity);
        }
      } else if (!domain.entities.includes(newEntity)) {
        domain.entities.splice(
          domain.entities.indexOf(oriEntity),
          1,
          newEntity,
        );
      } else {
        domain.entities.splice(domain.entities.indexOf(oriEntity), 1);
      }

      const cloneData = {
        stories,
        nlu,
        domain,
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '編輯關鍵字代表值失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '編輯關鍵字代表值成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'EDIT_ENTITY_VALUE': {
      const { stepIntent, oriEntityValue, newEntityValue, storyName } =
        action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetStory, onSetAllTrainData } = state;

      // 獲取使用者對話
      let userSay;
      stories.map((item) => {
        if (item.story === storyName) {
          item.steps.map((step) => {
            if (step.intent && step.intent === stepIntent) {
              userSay = step.user;
            }
            return step;
          });
        }
        return item;
      });

      // 驗證新的關鍵字是否重複
      const isRepeat = nlu.rasa_nlu_data.common_examples.some((nluItem) => {
        if (nluItem.text === userSay && nluItem.intent === stepIntent) {
          return nluItem.entities.some(
            (entityItem) => entityItem.value === newEntityValue,
          );
        }
        return false;
      });

      // 關鍵字重複處理
      if (isRepeat) {
        return Toast.fire({
          icon: 'warning',
          title: '同一個對話內記憶槽代表值不可重複',
        });
      }

      let entityKey;
      nlu.rasa_nlu_data.common_examples.map((nluItem) => {
        if (nluItem.text === userSay && nluItem.intent === stepIntent) {
          nluItem.entities.map((entityItem) => {
            if (entityItem.value === oriEntityValue) {
              entityKey = entityItem.entity;
              entityItem.value = newEntityValue;
            }
            return entityItem;
          });
        }
        return nluItem;
      });

      stories.map((item) => {
        if (item.story === storyName) {
          item.steps.map((step) => {
            if (step.intent && step.intent === stepIntent) {
              step.entities.map((entityItem) => {
                if (Object.keys(entityItem)[0] === entityKey) {
                  entityItem[entityKey] = newEntityValue;
                }
                return entityItem;
              });
            }
            return step;
          });
        }
        return item;
      });

      const cloneData = {
        stories,
        nlu,
        domain,
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '編輯記憶槽代表值失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '編輯記憶槽代表值成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'DELETE_EXAMPLE': {
      const { userSay, stepIntent, storyName } = action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetStory, onSetAllTrainData } = state;

      // 驗證例句是否存在
      const isExist = nlu.rasa_nlu_data.common_examples.filter(
        (nluItem) => nluItem.intent === stepIntent && nluItem.text === userSay,
      )[0];

      // 例句不存在處理
      if (!isExist) {
        return Toast.fire({
          icon: 'warning',
          title: '查無此例句，請重新嘗試',
        });
      }

      // 獲取所有例句的值
      const allExample = nlu.rasa_nlu_data.common_examples.map(
        (nluItem) => nluItem.text,
      );

      // 刪除例句
      nlu.rasa_nlu_data.common_examples.splice(allExample.indexOf(userSay), 1);
      const cloneData = {
        stories,
        nlu,
        domain,
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '刪除例句失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '刪除例句成功',
        });
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    }
    case 'CREATE_SLOT': {
      const formValue = action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetAllTrainData } = state;
      const { slotName, slotType, slotValues } = formValue;

      // 新增domain slot資訊
      domain.slots[slotName] = { type: slotType };

      // 如果slot type是儲存槽的話，要多一個values屬性並把slotValues裡的name放進values裡
      if (slotType === 'categorical') {
        domain.slots[slotName].values = [];
        slotValues.map((item) => domain.slots[slotName].values.push(item.name));
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
            title: '新增記錄槽失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '新增記錄槽成功',
        });
        return onSetAllTrainData(res.data);
      });
    }
    case 'REMOVE_SLOT': {
      const slotKey = action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetAllTrainData } = state;

      // 利用slot key刪除domain slot
      delete domain.slots[slotKey];

      const cloneData = {
        stories,
        domain,
        nlu,
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '刪除記錄槽失敗',
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: '刪除記錄槽成功',
        });
        return onSetAllTrainData(res.data);
      });
    }
    case 'ADD_SLOT_VALUE': {
      const { slotValues } = action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetAllTrainData } = state;

      slotValues.slotValueItems.map((item) =>
        domain.slots[slotValues.slotName].values.push(item.name),
      );

      const cloneData = {
        stories,
        domain,
        nlu,
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: `新增${slotValues.slotName}的儲存槽值失敗`,
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: `新增${slotValues.slotName}的儲存槽值成功`,
        });
        return onSetAllTrainData(res.data);
      });
    }
    case 'REMOVE_SLOT_VALUE': {
      const slotValue = action.payload;
      const { stories, nlu, domain } = cloneDeep(state.cloneData);
      const { onSetAllTrainData } = state;

      // 獲取該儲存槽值在domain slots values中的陣列位置
      const idx = domain.slots[slotValue.key].values.indexOf(slotValue.value);
      // 使用idx刪除該儲存槽值在domain slots values裡的資料
      domain.slots[slotValue.key].values.splice(idx, 1);

      const cloneData = {
        stories,
        domain,
        nlu,
      };

      return postAllTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: `刪除${slotValue.key}的儲存槽值失敗`,
            text: res.message,
          });
        }
        Toast.fire({
          icon: 'success',
          title: `刪除${slotValue.key}的儲存槽值成功`,
        });
        return onSetAllTrainData(res.data);
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
          .catch(() => {
            set({ user: null, isAppInitializedComplete: true });
            Toast.fire({
              icon: 'error',
              title: '無效Token',
            }).then(() => {
              cleanToken();
              window.location.reload();
            });
          });
      } else {
        set({ isAppInitializedComplete: true });
      }
    },
    async trainRasa(currentData: ApiTrainDataType) {
      // 獲取rasa最新訓練狀態
      const rasaState = await fetchRasaTrainState();
      // 訓練中
      if (rasaState > 0) {
        set({ rasaTrainState: rasaState });
        Toast.fire({
          icon: 'warning',
          title: '機器人訓練中，請稍後',
        });
      } else {
        // 可訓練
        // 驗證token
        verifyToken(getJWTToken())
          .then(() => {
            // token有效
            // 設定訓練狀態
            set({ rasaTrainState: 1 });
            // 發送訓練檔
            return postTrainDataToRasa(currentData);
          })
          .then((fileName) => loadedNewModel(fileName)) // 回傳最新model名稱，使用loadedNewModel通知rasa套用最新model
          .then((res) => {
            // 訓練正確
            if (res.status === 204) {
              set({ rasaTrainState: 0 });
            }
          })
          .catch((err) => {
            // token失效處理方式
            console.log('err:', err);
            set({ user: null, isAppInitializedComplete: true });
            Toast.fire({
              icon: 'error',
              title: '無效Token',
            }).then(() => {
              cleanToken();
              window.location.reload();
            });
          });
      }
    },
    onLogin(email: string, password: string) {
      set({ loading: true });
      fetchLogin(email, password).then((res) => {
        if (res.status === 'success') {
          set({ user: res.user, loading: false, currentPage: '首頁' });
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
      set({ user: null });
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
    onSetCurrentPage(pageName: string) {
      set({ currentPage: pageName });
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
    onCreateExample(
      userSay: string,
      stepIntent: string,
      example: string,
      exampleEntities: NluEntitiesType[],
      storyName: string,
    ) {
      dispatch(
        actionCreateExample(
          userSay,
          stepIntent,
          example,
          exampleEntities,
          storyName,
        ),
      );
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
    onEditIntent(oriIntent: string, intent: string, storyName: string) {
      dispatch(actionEditIntent(oriIntent, intent, storyName));
    },
    onCreateEntities(
      entities: NluEntitiesType,
      intent: string,
      storyName: string,
    ) {
      dispatch(actionCreateEntities(entities, intent, storyName));
    },
    onDeleteEntities(entity: string, intent: string, storyName: string) {
      dispatch(actionDeleteEntities(entity, intent, storyName));
    },
    onEditEntityShowValue(
      stepIntent: string,
      currentEntityValue: string,
      newEntityShowValue: string,
      storyName: string,
    ) {
      dispatch(
        actionEditEntityShowValue(
          stepIntent,
          currentEntityValue,
          newEntityShowValue,
          storyName,
        ),
      );
    },
    onEditEntity(
      stepIntent: string,
      oriEntity: string,
      newEntity: string,
      storyName: string,
    ) {
      dispatch(actionEditEntity(stepIntent, oriEntity, newEntity, storyName));
    },
    onEditEntityValue(
      stepIntent: string,
      oriEntityValue: string,
      newEntityValue: string,
      storyName: string,
    ) {
      dispatch(
        actionEditEntityValue(
          stepIntent,
          oriEntityValue,
          newEntityValue,
          storyName,
        ),
      );
    },
    onDeleteExample(userSay: string, stepIntent: string, storyName: string) {
      dispatch(actionDeleteExample(userSay, stepIntent, storyName));
    },
    onCreateSlot(formValue: {
      slotName: string,
      slotType: string,
      slotValues: { name: string, id: string }[],
    }) {
      dispatch(actionCreateSlot(formValue));
    },
    onRemoveSlot(slotKey: string) {
      dispatch(actionRemoveSlot(slotKey));
    },
    onAddSlotValue(slotValues: {
      slotName: string,
      slotValueItems: { name: string, id: string }[],
    }) {
      dispatch(actionAddSlotValue(slotValues));
    },
    onRemoveSlotValue(slotValue: { key: string, value: string }) {
      dispatch(actionRemoveSlotValue(slotValue));
    },
  };
});

export default useStoryStore;
