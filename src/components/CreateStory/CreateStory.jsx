import * as React from 'react';
// import { Toast } from 'utils/swalInput';
import shallow from 'zustand/shallow';
import CheckPoint from 'components/CheckPoint';
import style from './CreateStory.module.scss';
import StepControl from './StepControl';
import UserStep from '../UserStep';
import BotStep from '../BotStep';
import type { StoryType, ExampleType, State, CreateStoryState } from '../types';
import useStoryStore from '../../store/useStoryStore';
import StepAlert from './StepAlert';
import useCreateStoryStore from '../../store/useCreateStoryStore';

type CreateStoryProps = {
  isCreate: boolean,
  newStory: StoryType,
  nlu: ExampleType[],
  actions: string[],
  onClickSaveBtn: (story: StoryType) => void,
};

const CreateStory: React.FC<CreateStoryProps> = (props) => {
  const { isCreate, nlu, actions, onClickSaveBtn } = props;
  const { stories } = useStoryStore((state: State) => {
    return {
      stories: state.stories,
    };
  }, shallow);

  const {
    newStory,
    onEditUserSay,
    onEditIntent,
    onCreateExample,
    onDeleteExample,
    onCreateEntities,
    onDeleteEntities,
    onEditEntityShowValue,
    onEditEntity,
    onEditEntityValue,
    onEditBotRes,
    onRemoveUserStep,
    onRemoveBotStep,
    onAddResButtons,
    onEditResButtons,
    onRemoveResButton,
    onCreateBranchStory,
    onDeleteBranchStory,
  } = useCreateStoryStore((state: CreateStoryState) => {
    return {
      newStory: state.newStory,
      onEditUserSay: state.onEditUserSay,
      onEditIntent: state.onEditIntent,
      onCreateExample: state.onCreateExample,
      onDeleteExample: state.onDeleteExample,
      onCreateEntities: state.onCreateEntities,
      onDeleteEntities: state.onDeleteEntities,
      onEditEntityShowValue: state.onEditEntityShowValue,
      onEditEntity: state.onEditEntity,
      onEditEntityValue: state.onEditEntityValue,
      onEditBotRes: state.onEditBotRes,
      onRemoveUserStep: state.onRemoveUserStep,
      onRemoveBotStep: state.onRemoveBotStep,
      onAddResButtons: state.onAddResButtons,
      onEditResButtons: state.onEditResButtons,
      onRemoveResButton: state.onRemoveResButton,
      onCreateBranchStory: state.onCreateBranchStory,
      onDeleteBranchStory: state.onDeleteBranchStory,
    };
  }, shallow);
  /**
   * @type {[boolean, Function]}
   */
  const [isUser, setIsUser] = React.useState(false);

  const [isInputFocus, setIsInputFocus] = React.useState(undefined);

  React.useEffect(() => {
    // 雙驚嘆號為判斷是否存在，只返回boolean
    setIsUser(
      newStory.steps.length
        ? !!newStory.steps[newStory.steps.length - 1].intent ||
            !!newStory.steps[newStory.steps.length - 1].checkpoint
        : false,
    );
  }, [setIsUser, newStory]);

  // 控制顯示目前設定是誰的步驟
  let CurStepAlert;
  if (!isUser) {
    if (isInputFocus) {
      CurStepAlert = <StepAlert stepRole="user" />;
    }
  } else if (isInputFocus) {
    CurStepAlert = <StepAlert stepRole="bot" />;
  }

  // 編輯使用者對話;
  // const atEditUserSay = React.useCallback(
  //   (oriUserSay: string, userSay: string) => {
  //     // 驗證使用者對話是否重複
  //     const repeat = [];
  //     nlu.map((nluItem) =>
  //       nluItem.text === userSay ? repeat.push(userSay) : nluItem,
  //     );
  //     newStory.steps.map((step) =>
  //       step.user === userSay ? repeat.push(userSay) : step,
  //     );
  //     if (repeat.length) {
  //       return Toast.fire({
  //         icon: 'warning',
  //         title: `使用者對話『${userSay}』重複`,
  //       });
  //     }
  //     return onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (step.user === oriUserSay && step.intent === oriUserSay) {
  //             step.user = userSay;
  //             step.intent = userSay;
  //           } else {
  //             step.user = userSay;
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory, nlu, newStory],
  // );

  // 編輯意圖
  // const atEditIntent = React.useCallback(
  //   (oriIntent: string, intent: string) => {
  //     const repeat = [];
  //     nlu.map((nluItem) =>
  //       nluItem.intent === intent ? repeat.push(intent) : nluItem,
  //     );
  //     newStory.steps.map((step) =>
  //       step.intent === intent ? repeat.push(intent) : step,
  //     );
  //     if (repeat.length) {
  //       return Toast.fire({
  //         icon: 'warning',
  //         title: `意圖『${intent}』重複`,
  //       });
  //     }
  //     return onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (step.intent === oriIntent) {
  //             step.intent = intent;
  //             if (step.examples.length) {
  //               step.examples.map((example) => {
  //                 example.intent = intent;
  //                 return example;
  //               });
  //             }
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory, nlu, newStory],
  // );

  // 新增例句
  // const atCreateExample = React.useCallback(
  //   (intent: string, example: string, exampleEntities: NluEntitiesType[]) => {
  //     if (example === '') return;
  //     const currentExample = example.trimStart().trimEnd();
  //     const repeat = [];
  //     // 驗證例句是否重複
  //     // 驗證所有例句
  //     nlu.map((nluItem) =>
  //       nluItem.text === currentExample ? repeat.push(currentExample) : nluItem,
  //     );

  //     newStory.steps.map((step) => {
  //       if (step.intent) {
  //         if (step.user === currentExample) {
  //           repeat.push(currentExample);
  //         }
  //         if (step.examples.length) {
  //           step.examples.map((stepExample) => {
  //             if (stepExample.text === currentExample) {
  //               repeat.push(currentExample);
  //             }
  //             return stepExample;
  //           });
  //         }
  //       }
  //       return step;
  //     });
  //     console.log('repeat', repeat);
  //     if (repeat.length) {
  //       Toast.fire({
  //         title: '以下例句重複',
  //         text: `${repeat.toString()}`,
  //         icon: 'warning',
  //       });
  //       return;
  //     }
  //     onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (step.intent === intent) {
  //             step.examples.push({
  //               text: example,
  //               intent,
  //               entities: exampleEntities,
  //             });
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory, nlu, newStory.steps],
  // );

  // 刪除例句
  // const atDeleteExample = React.useCallback(
  //   (userSay: string, intent: string) => {
  //     onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (step.intent && step.intent === intent) {
  //             const allExample = step.examples.map((example) => example.text);
  //             step.examples.splice(allExample.indexOf(userSay), 1);
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory],
  // );

  // 新增關鍵字
  // const atCreateEntities = React.useCallback(
  //   (entities: NluEntitiesType, intent: string) => {
  //     return onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (step.intent === intent) {
  //             step.entities.push(entities);
  //             step.entities.sort((a, b) => a.start - b.start);
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory],
  // );

  // 刪除關鍵字
  // const atDeleteEntities = React.useCallback(
  //   (entity: string, intent: string) => {
  //     return onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (step.intent === intent && step.entities.length) {
  //             const entitiesKeys = step.entities.map((item) => item.entity);
  //             step.entities.splice(entitiesKeys.indexOf(entity), 1);
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory],
  // );

  // 編輯關鍵字位置
  // const atEditEntityShowValue = React.useCallback(
  //   (stepIntent: string, entityValue: string, newEntityShowValue: string) => {
  //     const isValidEntityShowValue = newStory.steps.some((step) => {
  //       if (step.intent && step.intent === stepIntent) {
  //         return step.user.includes(newEntityShowValue);
  //       }
  //       return false;
  //     });
  //     if (!isValidEntityShowValue) {
  //       return Toast.fire({
  //         icon: 'warning',
  //         title: '請填入正確的關鍵字',
  //       });
  //     }

  //     const isRepeat = newStory.steps.some((step) => {
  //       if (step.intent && step.entities.length && step.intent === stepIntent) {
  //         return step.entities.some((entityItem) => {
  //           if (entityItem.value !== entityValue) {
  //             if (
  //               (entityItem.start <= step.user.indexOf(newEntityShowValue) &&
  //                 step.user.indexOf(newEntityShowValue) <=
  //                   entityItem.end - 1) ||
  //               (entityItem.start <=
  //                 step.user.indexOf(newEntityShowValue) +
  //                   newEntityShowValue.length -
  //                   1 &&
  //                 step.user.indexOf(newEntityShowValue) +
  //                   newEntityShowValue.length -
  //                   1 <=
  //                   entityItem.end)
  //             ) {
  //               return true;
  //             }
  //           }
  //           return false;
  //         });
  //       }
  //       return false;
  //     });
  //     if (isRepeat) {
  //       return Toast.fire({
  //         icon: 'warning',
  //         title: '關鍵字不可重疊',
  //       });
  //     }
  //     return onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (step.intent && step.entities.length) {
  //             step.entities.map((entityItem) => {
  //               if (entityItem.value === entityValue) {
  //                 entityItem.start = step.user.indexOf(newEntityShowValue);
  //                 entityItem.end =
  //                   step.user.indexOf(newEntityShowValue) +
  //                   newEntityShowValue.length;
  //               }
  //               return entityItem;
  //             });
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory, newStory],
  // );

  // 編輯關鍵字
  // const atEditEntity = React.useCallback(
  //   (stepIntent: string, oriEntity: string, newEntity: string) => {
  //     // 驗證關鍵字代表值是否有數字
  //     const regex = /^[0-9]*$/g;

  //     // 驗證關鍵字代表值是否在同一個對話內重複
  //     const isRepeat = newStory.steps.some((step) => {
  //       if (step.intent && step.intent === stepIntent) {
  //         return step.entities.some((item) => {
  //           if (item.entity !== oriEntity) {
  //             return item.entity === newEntity;
  //           }
  //           return false;
  //         });
  //       }
  //       return false;
  //     });

  //     if (isRepeat) {
  //       return Toast.fire({
  //         icon: 'warning',
  //         title: '同一個對話內關鍵字代表值不可重複',
  //       });
  //     }

  //     // 關鍵字代表值有數字
  //     if (regex.test(newEntity)) {
  //       return Toast.fire({
  //         icon: 'warning',
  //         title: '關鍵字代表值不可為純數字',
  //       });
  //     }

  //     return onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (step.intent === stepIntent) {
  //             step.entities = step.entities.map((entityItem) => {
  //               if (entityItem.entity === oriEntity) {
  //                 entityItem.entity = newEntity;
  //               }
  //               return entityItem;
  //             });
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory, newStory.steps],
  // );

  // 編輯關鍵字代表值
  // const atEditEntityValue = React.useCallback(
  //   (stepIntent: string, oriEntityValue: string, newEntityValue: string) => {
  //     const isRepeat = newStory.steps.some((step) => {
  //       if (step.intent && step.intent === stepIntent) {
  //         return step.entities.some(
  //           (entityItem) => entityItem.value === newEntityValue,
  //         );
  //       }
  //       return false;
  //     });

  //     if (isRepeat) {
  //       return Toast.fire({
  //         icon: 'warning',
  //         title: '同一個對話內記憶槽代表值不可重複',
  //       });
  //     }

  //     return onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (step.intent && step.intent === stepIntent) {
  //             step.entities.map((entityItem) => {
  //               if (entityItem.value === oriEntityValue) {
  //                 entityItem.value = newEntityValue;
  //               }
  //               return entityItem;
  //             });
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory, newStory.steps],
  // );

  // 編輯機器人回覆
  // const atEditBotRes = React.useCallback(
  //   (oriBotRes: string, botRes: string, action: string) => {
  //     return onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (
  //             step.action &&
  //             step.action === action &&
  //             step.response === oriBotRes
  //           ) {
  //             step.response = botRes;
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory],
  // );

  // 刪除使用者步驟
  // const atRemoveUserStep = React.useCallback(
  //   (intent: string, userSay: string) => {
  //     return onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.filter(
  //           (step) => step.intent !== intent && step.user !== userSay,
  //         ),
  //       };
  //     });
  //   },
  //   [onSetNewStory],
  // );

  // 刪除機器人步驟
  // const atRemoveBotStep = React.useCallback(
  //   (action: string) => {
  //     return onSetNewStory((prev) => {
  //       return {
  //         ...prev,
  //         steps: prev.steps.filter((step) => step.action !== action),
  //       };
  //     });
  //   },
  //   [onSetNewStory],
  // );

  // 增加機器人回覆選項
  // const atAddResButtons = React.useCallback(
  //   (action: string, title: string, payload: string, reply: string) => {
  //     return onSetNewStory((prev) => {
  //       const steps = prev.steps.map((step) => {
  //         if (step.action === action) {
  //           const isInStory = stories.some(
  //             (item) => item.story === `button_${title}`,
  //           );
  //           const isExist = step.buttons?.some(
  //             (button) => button.title === title,
  //           );

  //           if (isExist || isInStory) {
  //             Toast.fire({
  //               icon: 'warning',
  //               title: '此選項已存在',
  //             });
  //           } else if (step.buttons) {
  //             step.buttons.push({ title, payload, reply });
  //           } else {
  //             step.buttons = [{ title, payload, reply }];
  //           }
  //         }
  //         return step;
  //       });
  //       return {
  //         ...prev,
  //         steps,
  //       };
  //     });
  //   },
  //   [onSetNewStory, stories],
  // );

  // 編輯機器人選項
  // const atEditResButtons = React.useCallback(
  //   (
  //     action: string,
  //     title: string,
  //     oriPayload: string,
  //     payload: string,
  //     reply: string,
  //   ) => {
  //     return onSetNewStory((prev) => {
  //       const steps = prev.steps.map((step) => {
  //         if (step.action === action) {
  //           step.buttons.map((button) => {
  //             if (button.payload === oriPayload) {
  //               button.title = title;
  //               button.payload = payload;
  //               button.reply = reply;
  //             }
  //             return button;
  //           });
  //         }
  //         return step;
  //       });
  //       return {
  //         ...prev,
  //         steps,
  //       };
  //     });
  //   },
  //   [onSetNewStory],
  // );

  // 刪除機器人選項
  // const atRemoveResButton = React.useCallback(
  //   (action: string, payload: string) => {
  //     return onSetNewStory((prev) => {
  //       const steps = prev.steps.map((step) => {
  //         if (step.action === action) {
  //           step.buttons = step.buttons.filter(
  //             (button) => button.payload !== payload,
  //           );
  //         }
  //         return step;
  //       });
  //       return {
  //         ...prev,
  //         steps,
  //       };
  //     });
  //   },
  //   [onSetNewStory],
  // );

  // 刪除支線故事
  // const atDeleteBranchStory = React.useCallback(
  //   (checkPointName: string, branchName: string) => {
  //     onSetNewStory((prev) => {
  //       // 刪除支線故事
  //       let steps = prev.steps.map((step) => {
  //         if (step.checkpoint && step.checkpoint === checkPointName) {
  //           step.branchStories = step.branchStories.filter(
  //             (branchStory) => branchStory.story !== branchName,
  //           );
  //         }
  //         return step;
  //       });

  //       // 篩選出不是checkPoint步驟或branchStories.length不為0的步驟
  //       steps = steps.filter((step) =>
  //         step.checkpoint ? step.branchStories.length > 0 : step,
  //       );

  //       return {
  //         ...prev,
  //         steps,
  //       };
  //     });
  //   },
  //   [onSetNewStory],
  // );

  // 新建支線故事
  // const atCreateBranchStory = React.useCallback(
  //   (newBranchStory: {
  //     branchName: string,
  //     slotValues: {
  //       slotName: string,
  //       slotValue: string,
  //       id: string,
  //       hasSlotValues: boolean,
  //     }[],
  //     botRes: { action: string, response: string },
  //   }) => {
  //     onSetNewStory((prev) => {
  //       const isCheckPointExist = prev.steps.some((step) => step.checkpoint);
  //       if (!isCheckPointExist) {
  //         return {
  //           ...prev,
  //           steps: prev.steps.concat([
  //             {
  //               checkpoint: `${prev.story}_主線`,
  //               branchStories: [
  //                 {
  //                   story: `支線_${prev.story}_${newBranchStory.branchName}`,
  //                   steps: [
  //                     { checkpoint: `${prev.story}_主線` },
  //                     {
  //                       slot_was_set: newBranchStory.slotValues.map((item) => ({
  //                         [item.slotName]: item.slotValue,
  //                       })),
  //                     },
  //                     {
  //                       action: newBranchStory.botRes.action,
  //                       response: newBranchStory.botRes.response,
  //                     },
  //                   ],
  //                 },
  //               ],
  //             },
  //           ]),
  //         };
  //       }

  //       return {
  //         ...prev,
  //         steps: prev.steps.map((step) => {
  //           if (step.checkpoint) {
  //             step.branchStories = step.branchStories.concat([
  //               {
  //                 story: `支線_${prev.story}_${newBranchStory.branchName}`,
  //                 steps: [
  //                   { checkpoint: `${prev.story}_主線` },
  //                   {
  //                     slot_was_set: newBranchStory.slotValues.map((item) => ({
  //                       [item.slotName]: item.slotValue,
  //                     })),
  //                   },
  //                   {
  //                     action: newBranchStory.botRes.action,
  //                     response: newBranchStory.botRes.response,
  //                   },
  //                 ],
  //               },
  //             ]);
  //           }
  //           return step;
  //         }),
  //       };
  //     });
  //   },
  //   [onSetNewStory],
  // );

  return (
    <div className={style.root}>
      <div className="col d-flex align-items-center">
        <div className={style.title}>{newStory.story}</div>
        <button
          type="button"
          className="btn btn-secondary mx-4"
          onClick={() => onClickSaveBtn(newStory)}
        >
          儲存
        </button>
      </div>
      <div className={style.stepsPanel} id="stepsPanel">
        {newStory.steps?.length !== 0 &&
          newStory.steps.map((step) => {
            // 要先將值取出來，再當作props傳進去，React才會檢查到有改變需要重新render
            const {
              intent,
              user,
              entities,
              examples,
              action,
              response,
              buttons,
              checkpoint,
              branchStories,
            } = step;

            if (step.intent) {
              return (
                <UserStep
                  key={step.intent}
                  isCreate={isCreate}
                  step={{ intent, user, entities, examples }}
                  storyName={newStory.story}
                  newStory={newStory}
                  onEditUserSay={onEditUserSay}
                  onEditIntent={onEditIntent}
                  onCreateExample={onCreateExample}
                  onDeleteExample={onDeleteExample}
                  onCreateEntities={onCreateEntities}
                  onDeleteEntities={onDeleteEntities}
                  onEditEntityShowValue={onEditEntityShowValue}
                  onEditEntity={onEditEntity}
                  onEditEntityValue={onEditEntityValue}
                  onRemoveUserStep={onRemoveUserStep}
                  onCreateBranchStory={onCreateBranchStory}
                />
              );
            }
            if (step.action) {
              return (
                <BotStep
                  key={step.action}
                  isCreate={isCreate}
                  step={{ action, response, buttons }}
                  storyName={newStory.story}
                  stories={stories}
                  onEditBotRes={onEditBotRes}
                  onRemoveBotStep={onRemoveBotStep}
                  onAddResButtons={onAddResButtons}
                  onEditResButtons={onEditResButtons}
                  onRemoveResButton={onRemoveResButton}
                />
              );
            }

            return (
              <CheckPoint
                key={checkpoint}
                branch={branchStories}
                onDeleteBranchStory={onDeleteBranchStory}
              />
            );
          })}
        {CurStepAlert}
      </div>
      <StepControl
        isUser={isUser}
        nlu={nlu}
        steps={newStory.steps}
        actions={actions}
        onSetIsInputFocus={setIsInputFocus}
      />
    </div>
  );
};

export default React.memo(CreateStory);
