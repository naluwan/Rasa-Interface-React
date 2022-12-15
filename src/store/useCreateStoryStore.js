import create from 'zustand';
import type { Action } from 'actions';
import {
  actionCreateStoryEditUserSay,
  actionCreateStoryCreateUserStep,
  actionCreateNewStory,
  actionCreateStoryEditIntent,
  actionCreateStoryCreateExample,
  actionCreateStoryDeleteExample,
  actionCreateStoryCreateEntities,
  actionCreateStoryDeleteEntities,
  actionCreateStoryEditEntityShowValue,
  actionCreateStoryEditEntity,
  actionCreateStoryEditEntityValue,
  actionCreateStoryCreateBotStep,
  actionCreateStoryEditBotRes,
  actionCreateStoryRemoveUserStep,
  actionCreateStoryRemoveBotStep,
  actionCreateStoryAddResButtons,
  actionCreateStoryEditResButtons,
  actionCreateRemoveResButton,
  actionCreateStoryCreateBranchStory,
  actionCreateStoryDeleteBranchStory,
  actionCheckPointConnectBranchStory,
  actionCheckPointDeleteConnectBranchStory,
  actionCreateStoryBranchStoryEditBotRes,
  actionCreateStoryConnectStoryEditBotRes,
  actionCreateStoryBranchStoryAddResButtons,
  actionCreateStoryBranchStoryRemoveResButton,
  actionCreateStoryBranchStoryEditResButtons,
  actionCreateStoryConnectStoryAddResButtons,
} from 'actions';
import type {
  NluType,
  NluEntitiesType,
  CreateStoryState,
  StoryType,
} from '../components/types';
import { Toast } from '../utils/swalInput';

const initialState = {
  newStory: {},
  currentStep: '',
  checkPointName: '',
  selectedBranchStory: {
    story: '',
    steps: [],
  },
  selectedConnectBranchStory: {
    story: '',
    steps: [],
  },
};

const reducer = (state: CreateStoryState, action: Action): State => {
  switch (action.type) {
    case 'CREATE_NEW_STORY': {
      const storyName = action.payload;
      return {
        ...state,
        newStory: { story: storyName, steps: [] },
      };
    }
    case 'CREATE_STORY_CREATE_USER_STEP': {
      const userSay = action.payload;
      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.concat([
            { user: userSay, intent: userSay, entities: [], examples: [] },
          ]),
        },
      };
    }
    case 'CREATE_STORY_EDIT_USER_SAY': {
      const { oriUserSay, userSay, nlu } = action.payload;
      const { newStory } = state;
      const repeat = [];
      nlu.rasa_nlu_data.common_examples.map((nluItem) =>
        nluItem.text === userSay ? repeat.push(userSay) : nluItem,
      );
      newStory.steps.map((step) =>
        step.user === userSay ? repeat.push(userSay) : step,
      );
      if (repeat.length) {
        return Toast.fire({
          icon: 'warning',
          title: `使用者對話『${userSay}』重複`,
        });
      }
      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.user === oriUserSay && step.intent === oriUserSay) {
              step.user = userSay;
              step.intent = userSay;
            } else {
              step.user = userSay;
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_EDIT_INTENT': {
      const { oriIntent, intent, nlu } = action.payload;
      const { newStory } = state;
      const repeat = [];
      nlu.rasa_nlu_data.common_examples.map((nluItem) =>
        nluItem.intent === intent ? repeat.push(intent) : nluItem,
      );
      newStory.steps.map((step) =>
        step.intent === intent ? repeat.push(intent) : step,
      );
      if (repeat.length) {
        return Toast.fire({
          icon: 'warning',
          title: `意圖『${intent}』重複`,
        });
      }
      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.intent === oriIntent) {
              step.intent = intent;
              if (step.examples.length) {
                step.examples.map((example) => {
                  example.intent = intent;
                  return example;
                });
              }
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_CREATE_EXAMPLE': {
      const { intent, example, exampleEntities, nlu } = action.payload;
      const { newStory } = state;
      const currentExample = example.trimStart().trimEnd();
      const repeat = [];
      // 驗證例句是否重複
      // 驗證所有例句
      nlu.rasa_nlu_data.common_examples.map((nluItem) =>
        nluItem.text === currentExample ? repeat.push(currentExample) : nluItem,
      );

      newStory.steps.map((step) => {
        if (step.intent) {
          if (step.user === currentExample) {
            repeat.push(currentExample);
          }
          if (step.examples.length) {
            step.examples.map((stepExample) => {
              if (stepExample.text === currentExample) {
                repeat.push(currentExample);
              }
              return stepExample;
            });
          }
        }
        return step;
      });

      if (repeat.length) {
        return Toast.fire({
          title: '以下例句重複',
          text: `${repeat.toString()}`,
          icon: 'warning',
        });
      }

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.intent === intent) {
              step.examples = step.examples.concat([
                {
                  text: example,
                  intent,
                  entities: exampleEntities,
                },
              ]);
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_DELETE_EXAMPLE': {
      const { userSay, intent } = action.payload;
      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.intent && step.intent === intent) {
              const allExample = step.examples.map((example) => example.text);
              step.examples.splice(allExample.indexOf(userSay), 1);
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_CREATE_ENTITIES': {
      const { entities, intent } = action.payload;
      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.intent === intent) {
              step.entities.push(entities);
              step.entities.sort((a, b) => a.start - b.start);
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_DELETE_ENTITIES': {
      const { entity, intent } = action.payload;
      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.intent === intent && step.entities.length) {
              const entitiesKeys = step.entities.map((item) => item.entity);
              step.entities.splice(entitiesKeys.indexOf(entity), 1);
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_EDIT_ENTITY_SHOW_VALUE': {
      const { stepIntent, entityValue, newEntityShowValue } = action.payload;
      const { newStory } = state;
      const isValidEntityShowValue = newStory.steps.some((step) => {
        if (step.intent && step.intent === stepIntent) {
          return step.user.includes(newEntityShowValue);
        }
        return false;
      });

      if (!isValidEntityShowValue) {
        return Toast.fire({
          icon: 'warning',
          title: '請填入正確的關鍵字',
        });
      }

      const isRepeat = newStory.steps.some((step) => {
        if (step.intent && step.entities.length && step.intent === stepIntent) {
          return step.entities.some((entityItem) => {
            if (entityItem.value !== entityValue) {
              if (
                (entityItem.start <= step.user.indexOf(newEntityShowValue) &&
                  step.user.indexOf(newEntityShowValue) <=
                    entityItem.end - 1) ||
                (entityItem.start <=
                  step.user.indexOf(newEntityShowValue) +
                    newEntityShowValue.length -
                    1 &&
                  step.user.indexOf(newEntityShowValue) +
                    newEntityShowValue.length -
                    1 <=
                    entityItem.end)
              ) {
                return true;
              }
            }
            return false;
          });
        }
        return false;
      });

      if (isRepeat) {
        return Toast.fire({
          icon: 'warning',
          title: '關鍵字不可重疊',
        });
      }

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.intent && step.entities.length) {
              step.entities.map((entityItem) => {
                if (entityItem.value === entityValue) {
                  entityItem.start = step.user.indexOf(newEntityShowValue);
                  entityItem.end =
                    step.user.indexOf(newEntityShowValue) +
                    newEntityShowValue.length;
                }
                return entityItem;
              });
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_EDIT_ENTITY': {
      const { stepIntent, oriEntity, newEntity } = action.payload;
      const { newStory } = state;
      // 驗證關鍵字代表值是否有數字
      const regex = /^[0-9]*$/g;

      // 驗證關鍵字代表值是否在同一個對話內重複
      const isRepeat = newStory.steps.some((step) => {
        if (step.intent && step.intent === stepIntent) {
          return step.entities.some((item) => {
            if (item.entity !== oriEntity) {
              return item.entity === newEntity;
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

      // 關鍵字代表值有數字
      if (regex.test(newEntity)) {
        return Toast.fire({
          icon: 'warning',
          title: '關鍵字代表值不可為純數字',
        });
      }

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.intent === stepIntent) {
              step.entities = step.entities.map((entityItem) => {
                if (entityItem.entity === oriEntity) {
                  entityItem.entity = newEntity;
                }
                return entityItem;
              });
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_EDIT_ENTITY_VALUE': {
      const { stepIntent, oriEntityValue, newEntityValue } = action.payload;
      const { newStory } = state;
      const isRepeat = newStory.steps.some((step) => {
        if (step.intent && step.intent === stepIntent) {
          return step.entities.some(
            (entityItem) => entityItem.value === newEntityValue,
          );
        }
        return false;
      });

      if (isRepeat) {
        return Toast.fire({
          icon: 'warning',
          title: '同一個對話內記憶槽代表值不可重複',
        });
      }

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.intent && step.intent === stepIntent) {
              step.entities.map((entityItem) => {
                if (entityItem.value === oriEntityValue) {
                  entityItem.value = newEntityValue;
                }
                return entityItem;
              });
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_CREATE_BOT_STEP': {
      const { actionName, botRes } = action.payload;

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.concat([
            {
              action: actionName,
              response: botRes,
            },
          ]),
        },
      };
    }
    case 'CREATE_STORY_EDIT_BOT_RES': {
      const { oriBotRes, botRes, actionName } = action.payload;

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (
              step.action &&
              step.action === actionName &&
              step.response === oriBotRes
            ) {
              step.response = botRes;
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_REMOVE_USER_STEP': {
      const { intent, userSay } = action.payload;

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.filter(
            (step) => step.intent !== intent && step.user !== userSay,
          ),
        },
      };
    }
    case 'CREATE_STORY_REMOVE_BOT_STEP': {
      const actionName = action.payload;

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.filter(
            (step) => step.action !== actionName,
          ),
        },
      };
    }
    case 'CREATE_STORY_ADD_RES_BUTTONS': {
      const { actionName, title, payload, reply, stories } = action.payload;
      const { newStory } = state;
      const isInStory = stories.some(
        (item) => item.story === `button_${newStory.story}_${title}`,
      );

      const isExist = newStory.steps.some((step) => {
        if (step.action === actionName) {
          return step.buttons?.some((button) => button.title === title);
        }
        return false;
      });

      if (isExist || isInStory) {
        return Toast.fire({
          icon: 'warning',
          title: '此選項已存在',
        });
      }

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.action === actionName) {
              if (step.buttons) {
                step.buttons = step.buttons.concat([{ title, payload, reply }]);
              } else {
                step.buttons = [{ title, payload, reply }];
              }
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_EDIT_RES_BUTTONS': {
      const { actionName, title, oriPayload, payload, reply, stories } =
        action.payload;
      const { newStory } = state;

      const isInStory = stories.some(
        (item) => item.story === `button_${newStory.story}_${title}`,
      );

      const isExist = newStory.steps.some((step) => {
        if (step.action === actionName) {
          return step.buttons?.some((button) => button.title === title);
        }
        return false;
      });

      if (isExist || isInStory) {
        return Toast.fire({
          icon: 'warning',
          title: '此選項已存在',
        });
      }

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.action === actionName) {
              step.buttons.map((button) => {
                if (button.payload === oriPayload) {
                  button.title = title;
                  button.payload = payload;
                  button.reply = reply;
                }
                return button;
              });
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_REMOVE_RES_BUTTON': {
      const { actionName, payload } = action.payload;

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.action === actionName) {
              step.buttons = step.buttons.filter(
                (button) => button.payload !== payload,
              );
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_CREATE_BRANCH_STORY': {
      const newBranchStory = action.payload;
      const { newStory } = state;

      const isCheckPointExist = newStory.steps.some((step) => step.checkpoint);

      if (!isCheckPointExist) {
        if (newBranchStory.botRes) {
          return {
            ...state,
            newStory: {
              ...state.newStory,
              steps: state.newStory.steps.concat([
                {
                  checkpoint: `${newStory.story}_主線`,
                  branchStories: [
                    {
                      story: `${newStory.story}_${newBranchStory.branchName}`,
                      steps: [
                        { checkpoint: `${newStory.story}_主線` },
                        {
                          slot_was_set: newBranchStory.slotValues.map(
                            (item) => ({
                              [item.slotName]: item.slotValue,
                            }),
                          ),
                        },
                        {
                          action: newBranchStory.botRes.action,
                          response: newBranchStory.botRes.response,
                        },
                      ],
                    },
                  ],
                },
              ]),
            },
          };
        }
        return {
          ...state,
          newStory: {
            ...state.newStory,
            steps: state.newStory.steps.concat([
              {
                checkpoint: `${newStory.story}_主線`,
                branchStories: [
                  {
                    story: `${newStory.story}_${newBranchStory.branchName}`,
                    steps: [
                      { checkpoint: `${newStory.story}_主線` },
                      {
                        slot_was_set: newBranchStory.slotValues.map((item) => ({
                          [item.slotName]: item.slotValue,
                        })),
                      },
                    ],
                  },
                ],
              },
            ]),
          },
        };
      }

      if (newBranchStory.botRes) {
        return {
          ...state,
          newStory: {
            ...state.newStory,
            steps: state.newStory.steps.map((step) => {
              if (step.checkpoint) {
                step.branchStories = step.branchStories.concat([
                  {
                    story: `${newStory.story}_${newBranchStory.branchName}`,
                    steps: [
                      { checkpoint: `${newStory.story}_主線` },
                      {
                        slot_was_set: newBranchStory.slotValues.map((item) => ({
                          [item.slotName]: item.slotValue,
                        })),
                      },
                      {
                        action: newBranchStory.botRes.action,
                        response: newBranchStory.botRes.response,
                      },
                    ],
                  },
                ]);
              }
              return step;
            }),
          },
        };
      }
      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.checkpoint) {
              step.branchStories = step.branchStories.concat([
                {
                  story: `${newStory.story}_${newBranchStory.branchName}`,
                  steps: [
                    { checkpoint: `${newStory.story}_主線` },
                    {
                      slot_was_set: newBranchStory.slotValues.map((item) => ({
                        [item.slotName]: item.slotValue,
                      })),
                    },
                  ],
                },
              ]);
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_DELETE_BRANCH_STORY': {
      const { checkPointName, branchName } = action.payload;
      // console.log('checkPointName:', checkPointName);
      // console.log('branchName:', branchName);
      const { newStory } = state;
      let steps = newStory.steps.map((step) => {
        if (step.checkpoint && step.checkpoint === checkPointName) {
          step.branchStories = step.branchStories.filter(
            (branchStory) => branchStory.story !== branchName,
          );
        }
        return step;
      });

      // console.log('before steps:', steps);

      // 篩選出不是checkPoint步驟或branchStories.length不為0的步驟
      steps = steps.filter((step) =>
        step.checkpoint ? step.branchStories.length > 0 : step,
      );

      // console.log('after steps:', steps);

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps,
        },
      };
    }
    case 'CHECK_POINT_CONNECT_BRANCH_STORY': {
      const { newStory, newBranchStory } = action.payload;
      const { checkPointName } = state;

      const isCheckPointExist = newStory.steps.some((step) => {
        if (step.checkpoint) {
          return step.branchStories.some((branchStory) => {
            if (branchStory.story === checkPointName) {
              return branchStory.steps.some(
                (branchStep, idx) => idx !== 0 && branchStep.checkpoint,
              );
            }
            return false;
          });
        }
        return false;
      });

      if (!isCheckPointExist) {
        if (newBranchStory.botRes) {
          return {
            ...state,
            newStory: {
              ...state.newStory,
              steps: state.newStory.steps.map((step) => {
                if (step.checkpoint) {
                  step.branchStories = step.branchStories.map((branchStory) => {
                    if (branchStory.story === checkPointName) {
                      branchStory.steps = branchStory.steps.concat([
                        {
                          checkpoint: `${checkPointName}_主線`,
                          branchStories: [
                            {
                              story: `${checkPointName}_${newBranchStory.branchName}`,
                              steps: [
                                { checkpoint: `${checkPointName}_主線` },
                                {
                                  slot_was_set: newBranchStory.slotValues.map(
                                    (item) => ({
                                      [item.slotName]: item.slotValue,
                                    }),
                                  ),
                                },
                                {
                                  action: newBranchStory.botRes.action,
                                  response: newBranchStory.botRes.response,
                                },
                              ],
                            },
                          ],
                        },
                      ]);
                    }
                    return branchStory;
                  });
                }
                return step;
              }),
            },
          };
        }
        return {
          ...state,
          newStory: {
            ...state.newStory,
            steps: state.newStory.steps.map((step) => {
              if (step.checkpoint) {
                step.branchStories = step.branchStories.map((branchStory) => {
                  if (branchStory.story === checkPointName) {
                    branchStory.steps = branchStory.steps.concat([
                      {
                        checkpoint: `${checkPointName}_主線`,
                        branchStories: [
                          {
                            story: `${checkPointName}_${newBranchStory.branchName}`,
                            steps: [
                              { checkpoint: `${checkPointName}_主線` },
                              {
                                slot_was_set: newBranchStory.slotValues.map(
                                  (item) => ({
                                    [item.slotName]: item.slotValue,
                                  }),
                                ),
                              },
                            ],
                          },
                        ],
                      },
                    ]);
                  }
                  return branchStory;
                });
              }
              return step;
            }),
          },
        };
      }

      if (newBranchStory.botRes) {
        return {
          ...state,
          newStory: {
            ...state.newStory,
            steps: state.newStory.steps.map((step) => {
              if (step.checkpoint) {
                step.branchStories = step.branchStories.map((branchStory) => {
                  if (branchStory.story === checkPointName) {
                    // console.log('branchStory ===============>', branchStory);

                    branchStory.steps.map((branchStep, idx) => {
                      if (
                        idx !== 0 &&
                        branchStep.checkpoint &&
                        branchStep.checkpoint.slice(
                          0,
                          branchStep.checkpoint.lastIndexOf('_'),
                        ) === checkPointName
                      ) {
                        branchStep.branchStories =
                          branchStep.branchStories.concat([
                            {
                              story: `${checkPointName}_${newBranchStory.branchName}`,
                              steps: [
                                { checkpoint: `${checkPointName}_主線` },
                                {
                                  slot_was_set: newBranchStory.slotValues.map(
                                    (item) => ({
                                      [item.slotName]: item.slotValue,
                                    }),
                                  ),
                                },
                                {
                                  action: newBranchStory.botRes.action,
                                  response: newBranchStory.botRes.response,
                                },
                              ],
                            },
                          ]);
                      }
                      return branchStep;
                    });
                  }
                  return branchStory;
                });
              }
              return step;
            }),
          },
        };
      }

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.checkpoint) {
              step.branchStories = step.branchStories.map((branchStory) => {
                if (branchStory.story === checkPointName) {
                  branchStory.steps.map((branchStep) => {
                    if (
                      branchStep.checkpoint &&
                      branchStep.checkpoint.slice(
                        0,
                        branchStep.checkpoint.lastIndexOf('_'),
                      ) === checkPointName
                    ) {
                      branchStep.branchStories =
                        branchStep.branchStories.concat([
                          {
                            story: `${checkPointName}_${newBranchStory.branchName}`,
                            steps: [
                              { checkpoint: `${checkPointName}_主線` },
                              {
                                slot_was_set: newBranchStory.slotValues.map(
                                  (item) => ({
                                    [item.slotName]: item.slotValue,
                                  }),
                                ),
                              },
                            ],
                          },
                        ]);
                    }
                    return branchStep;
                  });
                }
                return branchStory;
              });
            }
            return step;
          }),
        },
      };
    }
    case 'CHECK_POINT_DELETE_CONNECT_BRANCH_STORY': {
      const { checkPointName, branchName } = action.payload;
      const { newStory } = state;

      let steps = newStory.steps.map((step) => {
        if (step.checkpoint) {
          step.branchStories = step.branchStories.map((branchStory) => {
            if (
              branchStory.story ===
              checkPointName.slice(0, checkPointName.lastIndexOf('_'))
            ) {
              branchStory.steps.map((branchStep) => {
                if (
                  branchStep.checkpoint &&
                  branchStep.checkpoint === checkPointName
                ) {
                  branchStep.branchStories = branchStep.branchStories.filter(
                    (item) => item.story !== branchName,
                  );
                }
                return branchStep;
              });
            }
            return branchStory;
          });
        }
        return step;
      });

      steps = steps.map((step) => {
        if (step.checkpoint) {
          step.branchStories.map((branchStory) => {
            if (
              branchStory.story ===
              checkPointName.slice(0, checkPointName.lastIndexOf('_'))
            ) {
              branchStory.steps = branchStory.steps.filter((branchStep, idx) =>
                idx !== 0 && branchStep.checkpoint
                  ? branchStep.branchStories.length > 0
                  : branchStep,
              );
            }
            return branchStory;
          });
        }
        return step;
      });

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps,
        },
      };
    }
    case 'CREATE_STORY_BRANCH_STORY_EDIT_BOT_RES': {
      const { oriBotRes, botRes, actionName, checkPointName } = action.payload;

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.checkpoint) {
              step.branchStories = step.branchStories.map((branchStory) => {
                if (branchStory.story === checkPointName) {
                  branchStory.steps = branchStory.steps.map((branchStep) => {
                    if (
                      branchStep.action === actionName &&
                      branchStep.response === oriBotRes
                    ) {
                      branchStep.response = botRes;
                    }
                    return branchStep;
                  });
                }
                return branchStory;
              });
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_CONNECT_STORY_EDIT_BOT_RES': {
      const {
        oriBotRes,
        botRes,
        actionName,
        checkPointName,
        connectStoryName,
      } = action.payload;

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.checkpoint) {
              step.branchStories = step.branchStories.map((branchStory) => {
                if (branchStory.story === checkPointName) {
                  branchStory.steps = branchStory.steps.map(
                    (branchStep, idx) => {
                      if (idx !== 0 && branchStep.checkpoint) {
                        branchStep.branchStories = branchStep.branchStories.map(
                          (connectStory) => {
                            if (connectStory.story === connectStoryName) {
                              connectStory.steps = connectStory.steps.map(
                                (connectStep) => {
                                  if (
                                    connectStep.action === actionName &&
                                    connectStep.response === oriBotRes
                                  ) {
                                    connectStep.response = botRes;
                                  }
                                  return connectStep;
                                },
                              );
                            }
                            return connectStory;
                          },
                        );
                      }
                      return branchStep;
                    },
                  );
                }
                return branchStory;
              });
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_BRANCH_STORY_ADD_RES_BUTTONS': {
      const { actionName, title, payload, reply, stories, checkPointName } =
        action.payload;
      const { newStory } = state;

      const isInStory = stories.some(
        (item) => item.story === `button_${checkPointName}_${title}`,
      );

      const isExist = newStory.steps.some((step) => {
        if (step.checkpoint) {
          return step.branchStories.some((branchStory) => {
            if (branchStory.story === checkPointName) {
              return branchStory.steps.some((branchStep) => {
                if (branchStep.action === actionName) {
                  return branchStep.buttons?.some(
                    (button) => button.title === title,
                  );
                }
                return false;
              });
            }
            return false;
          });
        }
        return false;
      });

      if (isExist || isInStory) {
        return Toast.fire({
          icon: 'warning',
          title: '此選項已存在',
        });
      }

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.checkpoint) {
              step.branchStories = step.branchStories.map((branchStory) => {
                if (branchStory.story === checkPointName) {
                  branchStory.steps = branchStory.steps.map((branchStep) => {
                    if (branchStep.action === actionName) {
                      if (branchStep.buttons) {
                        branchStep.buttons = branchStep.buttons.concat([
                          { title, payload, reply },
                        ]);
                      } else {
                        branchStep.buttons = [{ title, payload, reply }];
                      }
                    }
                    return branchStep;
                  });
                }
                return branchStory;
              });
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_BRANCH_STORY_REMOVE_RES_BUTTON': {
      const { actionName, payload, checkPointName } = action.payload;

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.checkpoint) {
              step.branchStories = step.branchStories.map((branchStory) => {
                if (branchStory.story === checkPointName) {
                  branchStory.steps = branchStory.steps.map((branchStep) => {
                    if (branchStep.action && branchStep.action === actionName) {
                      branchStep.buttons = branchStep.buttons.filter(
                        (button) => button.payload !== payload,
                      );
                    }
                    return branchStep;
                  });
                }
                return branchStory;
              });
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_BRANCH_STORY_EDIT_RES_BUTTONS': {
      const {
        actionName,
        title,
        oriPayload,
        payload,
        reply,
        stories,
        checkPointName,
      } = action.payload;

      const { newStory } = state;

      // 獲取原title
      const curOriPayload = oriPayload.replace(/\//g, '');

      // 找出完全無更改的按鈕
      const ownButtonInfo = newStory.steps
        .filter((step) => step.checkpoint)
        .map((step) => step.branchStories)[0]
        .filter((item) => item.story === checkPointName)
        .map((item) => item.steps)[0]
        .filter((step) => step.action)
        .map((step) => step.buttons)[0]
        .filter((button) => button.title === title && button.reply === reply);

      // 完全相同就返回，不用更改
      if (ownButtonInfo.length) {
        return {
          ...state,
        };
      }

      // 比對stories訓練檔中有沒有重複
      const isInStory = stories.some(
        (item) => item.story === `button_${checkPointName}_${title}`,
      );

      const isExist = newStory.steps.some((step) => {
        if (step.checkpoint) {
          return step.branchStories.some((branchStory) => {
            if (branchStory.story === checkPointName) {
              return branchStory.steps.some((branchStep) => {
                if (branchStep.action && branchStep.action === actionName) {
                  return branchStep.buttons.some(
                    (button) => button.title === title,
                  );
                }
                return false;
              });
            }
            return false;
          });
        }
        return false;
      });

      // 如果存在stories訓練檔中或是存在新建故事的按鈕中且標題不等於原標題就提示選項已存在
      if ((isExist && title !== curOriPayload) || isInStory) {
        return Toast.fire({
          icon: 'warning',
          title: '此選項已存在',
        });
      }

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.checkpoint) {
              step.branchStories = step.branchStories.map((branchStory) => {
                if (branchStory.story === checkPointName) {
                  branchStory.steps = branchStory.steps.map((branchStep) => {
                    if (branchStep.action && branchStep.action === actionName) {
                      branchStep.buttons = branchStep.buttons.map((button) => {
                        if (button.payload === oriPayload) {
                          button.title = title;
                          button.payload = payload;
                          button.reply = reply;
                        }
                        return button;
                      });
                    }
                    return branchStep;
                  });
                }
                return branchStory;
              });
            }
            return step;
          }),
        },
      };
    }
    case 'CREATE_STORY_CONNECT_STORY_ADD_RES_BUTTONS': {
      const {
        actionName,
        title,
        payload,
        reply,
        stories,
        checkPointName,
        connectStoryName,
      } = action.payload;
      const { newStory } = state;

      console.log('actionName ===> ', actionName);
      console.log('title ===> ', title);
      console.log('payload ===> ', payload);
      console.log('reply ===> ', reply);
      console.log('stories ===> ', stories);
      console.log('checkPointName ===> ', checkPointName);
      console.log('connectStoryName ===> ', connectStoryName);
      console.log('newStory ===> ', newStory);

      const isInStory = stories.some(
        (item) =>
          item.story ===
          `button_${checkPointName}_${connectStoryName}_${title}`,
      );

      const isExist = newStory.steps.some((step) => {
        if (step.checkpoint) {
          return step.branchStories.some((branchStory) => {
            if (branchStory.story === checkPointName) {
              return branchStory.steps.some((branchStep, idx) => {
                console.log(
                  'outside connect story add res btn branch step ===> ',
                  branchStep,
                );
                if (idx !== 0 && branchStep.checkpoint) {
                  console.log(
                    'connect story add res btn branch step ===> ',
                    branchStep,
                  );
                  return branchStep.branchStories.some((connectStory) => {
                    if (connectStory.story === connectStoryName) {
                      return connectStory.steps.some((connectStep) => {
                        if (
                          connectStep.action &&
                          connectStep.action === actionName
                        ) {
                          return connectStep.buttons?.some(
                            (button) => button.title === title,
                          );
                        }
                        return false;
                      });
                    }
                    return false;
                  });
                }
                return false;
              });
            }
            return false;
          });
        }
        return false;
      });

      if (isExist || isInStory) {
        return Toast.fire({
          icon: 'warning',
          title: '此選項已存在',
        });
      }

      return {
        ...state,
        newStory: {
          ...state.newStory,
          steps: state.newStory.steps.map((step) => {
            if (step.checkpoint) {
              step.branchStories = step.branchStories.map((branchStory) => {
                if (branchStory.story === checkPointName) {
                  branchStory.steps = branchStory.steps.map(
                    (branchStep, idx) => {
                      if (idx !== 0 && branchStep.checkpoint) {
                        branchStep.branchStories = branchStep.branchStories.map(
                          (connectStory) => {
                            if (connectStory.story === connectStoryName) {
                              connectStory.steps = connectStory.steps.map(
                                (connectStep) => {
                                  if (
                                    connectStep.action &&
                                    connectStep.action === actionName
                                  ) {
                                    if (connectStep.buttons) {
                                      connectStep.buttons =
                                        connectStep.buttons.concat([
                                          { title, payload, reply },
                                        ]);
                                    } else {
                                      connectStep.buttons = [
                                        { title, payload, reply },
                                      ];
                                    }
                                  }
                                  return connectStep;
                                },
                              );
                            }
                            return connectStory;
                          },
                        );
                      }
                      return branchStep;
                    },
                  );
                }
                return branchStory;
              });
            }
            return step;
          }),
        },
      };
    }
    default:
      return state;
  }
};

const useCreateStoryStore = create((set) => {
  const dispatch = (action: Action) => {
    set((state) => {
      return reducer(state, action);
    });
  };
  return {
    ...initialState,
    // --------------------------- Action
    // 初始化新故事
    onInitialNewStory() {
      set({ newStory: {} });
    },
    // 設定新增支線故事彈跳窗是在支線故事內點擊
    onSetBranchStep() {
      set({ currentStep: 'branchStory' });
    },
    // 設定新增支線故事彈跳窗是在正常流程點擊
    onSetMainStep() {
      set({ currentStep: 'main' });
    },
    // 設定目前的支線故事名稱
    onSetCheckPointName(checkPointName: string) {
      set({ checkPointName });
    },
    // 設定目前選擇的支線故事
    onSetSelectedBranchStory(selectedBranchStory: StoryType) {
      set({ selectedBranchStory });
    },
    // 設定目前支線故事內串接的支線故事
    onSetSelectedConnectBranchStory(selectedConnectBranchStory: StoryType) {
      set({ selectedConnectBranchStory });
    },
    // 建立新故事
    onCreateNewStory(storyName: string) {
      dispatch(actionCreateNewStory(storyName));
    },
    // 新增使用者步驟
    onCreateUserStep(userSay: string) {
      dispatch(actionCreateStoryCreateUserStep(userSay));
    },
    // 編輯使用者對話
    onEditUserSay(
      oriUserSay: string,
      userSay: string,
      storyName: string,
      nlu: NluType,
    ) {
      dispatch(
        actionCreateStoryEditUserSay(oriUserSay, userSay, storyName, nlu),
      );
    },
    // 編輯意圖
    onEditIntent(
      oriIntent: string,
      intent: string,
      storyName: string,
      nlu: NluType,
    ) {
      dispatch(actionCreateStoryEditIntent(oriIntent, intent, storyName, nlu));
    },
    // 新增例句
    onCreateExample(
      intent: string,
      example: string,
      exampleEntities: NluEntitiesType[],
      storyName: string,
      nlu: NluType,
    ) {
      dispatch(
        actionCreateStoryCreateExample(
          intent,
          example,
          exampleEntities,
          storyName,
          nlu,
        ),
      );
    },
    // 刪除例句
    onDeleteExample(userSay: String, intent: string) {
      dispatch(actionCreateStoryDeleteExample(userSay, intent));
    },
    // 新增關鍵字
    onCreateEntities(entities: NluEntitiesType, intent: string) {
      dispatch(actionCreateStoryCreateEntities(entities, intent));
    },
    // 刪除關鍵字
    onDeleteEntities(entity: string, intent: string) {
      dispatch(actionCreateStoryDeleteEntities(entity, intent));
    },
    // 編輯關鍵字位置
    onEditEntityShowValue(
      stepIntent: string,
      entityValue: string,
      newEntityShowValue: string,
    ) {
      dispatch(
        actionCreateStoryEditEntityShowValue(
          stepIntent,
          entityValue,
          newEntityShowValue,
        ),
      );
    },
    // 編輯關鍵字
    onEditEntity(stepIntent: string, oriEntity: string, newEntity: string) {
      dispatch(actionCreateStoryEditEntity(stepIntent, oriEntity, newEntity));
    },
    // 編輯關鍵字代表值(儲存槽值)
    onEditEntityValue(
      stepIntent: string,
      oriEntityValue: string,
      newEntityValue: string,
    ) {
      dispatch(
        actionCreateStoryEditEntityValue(
          stepIntent,
          oriEntityValue,
          newEntityValue,
        ),
      );
    },
    // 新增機器人步驟
    onCreateBotStep(actionName: string, botRes: string) {
      dispatch(actionCreateStoryCreateBotStep(actionName, botRes));
    },
    // 編輯機器人回覆
    onEditBotRes(oriBotRes: string, botRes: string, actionName: string) {
      dispatch(actionCreateStoryEditBotRes(oriBotRes, botRes, actionName));
    },
    // 刪除使用者步驟
    onRemoveUserStep(intent: string, userSay: string) {
      dispatch(actionCreateStoryRemoveUserStep(intent, userSay));
    },
    // 刪除機器人步驟
    onRemoveBotStep(actionName: string) {
      dispatch(actionCreateStoryRemoveBotStep(actionName));
    },
    // 新增機器人按鈕選項
    onAddResButtons(
      actionName: string,
      title: string,
      payload: string,
      reply: string,
      storyName: string,
      stories: StoryType[],
    ) {
      dispatch(
        actionCreateStoryAddResButtons(
          actionName,
          title,
          payload,
          reply,
          storyName,
          stories,
        ),
      );
    },
    // 編輯機器人按鈕
    onEditResButtons(
      actionName: string,
      title: string,
      oriPayload: string,
      payload: string,
      reply: string,
      storyName: string,
      buttonActionName: string,
      stories: StoryType[],
    ) {
      dispatch(
        actionCreateStoryEditResButtons(
          actionName,
          title,
          oriPayload,
          payload,
          reply,
          storyName,
          buttonActionName,
          stories,
        ),
      );
    },
    // 移除機器人按鈕
    onRemoveResButton(actionName: string, payload: string) {
      dispatch(actionCreateRemoveResButton(actionName, payload));
    },
    // 新增支線故事
    onCreateBranchStory(newBranchStory: {
      branchName: string,
      slotValues: {
        slotName: string,
        slotValue: string,
        id: string,
        hasSlotValues: boolean,
      }[],
      botRes: { action: string, response: string },
    }) {
      dispatch(actionCreateStoryCreateBranchStory(newBranchStory));
    },
    // 移除支線故事
    onDeleteBranchStory(checkPointName: string, branchName: string) {
      dispatch(actionCreateStoryDeleteBranchStory(checkPointName, branchName));
    },
    // 支線故事內串接支線故事
    onConnectBranchStory(
      newStory: StoryType,
      newBranchStory: {
        branchName: string,
        slotValues: {
          slotName: string,
          slotValue: string,
          id: string,
          hasSlotValues: boolean,
        }[],
        botRes?: { action: string, response: string },
      },
    ) {
      dispatch(actionCheckPointConnectBranchStory(newStory, newBranchStory));
    },
    // 刪除支線故事內串接的支線故事
    onDeleteConnectBranchStory(checkPointName: string, branchName: string) {
      dispatch(
        actionCheckPointDeleteConnectBranchStory(checkPointName, branchName),
      );
    },
    // 編輯支線故事內的機器人回覆
    onEditBranchStoryBotRes(
      oriBotRes: string,
      botRes: string,
      actionName: string,
      storyName: string,
      checkPointName: string,
    ) {
      dispatch(
        actionCreateStoryBranchStoryEditBotRes(
          oriBotRes,
          botRes,
          actionName,
          storyName,
          checkPointName,
        ),
      );
    },
    // 編輯支線故事內串接支線故事的機器人回覆
    onEditConnectStoryBotRes(
      oriBotRes: string,
      botRes: string,
      actionName: string,
      storyName: string,
      checkPointName: String,
      connectStoryName: string,
    ) {
      dispatch(
        actionCreateStoryConnectStoryEditBotRes(
          oriBotRes,
          botRes,
          actionName,
          storyName,
          checkPointName,
          connectStoryName,
        ),
      );
    },
    // 支線故事新增機器人回覆按鈕
    onAddBranchStoryResButtons(
      actionName: string,
      title: string,
      payload: string,
      reply: string,
      storyName: string,
      stories: StoryType[],
      checkPointName: string,
    ) {
      dispatch(
        actionCreateStoryBranchStoryAddResButtons(
          actionName,
          title,
          payload,
          reply,
          storyName,
          stories,
          checkPointName,
        ),
      );
    },
    // 移除支線故事的機器人回覆按鈕
    onRemoveBranchStoryResButton(
      actionName: string,
      payload: string,
      storyName: string,
      buttonActionName: string,
      disabled: boolean,
      checkPointName: string,
    ) {
      dispatch(
        actionCreateStoryBranchStoryRemoveResButton(
          actionName,
          payload,
          storyName,
          buttonActionName,
          disabled,
          checkPointName,
        ),
      );
    },
    // 編輯支線故事的機器人按鈕
    onEditBranchStoryResButtons(
      actionName: string,
      title: string,
      oriPayload: string,
      payload: string,
      reply: string,
      storyName: string,
      buttonActionName: string,
      stories: StoryType[],
      checkPointName: string,
    ) {
      dispatch(
        actionCreateStoryBranchStoryEditResButtons(
          actionName,
          title,
          oriPayload,
          payload,
          reply,
          storyName,
          buttonActionName,
          stories,
          checkPointName,
        ),
      );
    },
    // 串接故事新增機器人回覆按鈕
    onAddConnectStoryResButtons(
      actionName: string,
      title: string,
      payload: string,
      reply: string,
      storyName: string,
      stories: StoryType[],
      checkPointName: string,
      connectStoryName: string,
    ) {
      dispatch(
        actionCreateStoryConnectStoryAddResButtons(
          actionName,
          title,
          payload,
          reply,
          storyName,
          stories,
          checkPointName,
          connectStoryName,
        ),
      );
    },
  };
});

export default useCreateStoryStore;
