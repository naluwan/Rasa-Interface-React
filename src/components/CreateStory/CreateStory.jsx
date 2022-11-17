import * as React from 'react';
import { Toast } from 'utils/swalInput';
import shallow from 'zustand/shallow';
import style from './CreateStory.module.scss';
import StepControl from './StepControl';
import UserStep from '../UserStep';
import BotStep from '../BotStep';
import type { StoryType, ExampleType, State, NluEntitiesType } from '../types';
import useStoryStore from '../../store/useStoryStore';
import StepAlert from './StepAlert';

type CreateStoryProps = {
  isCreate: boolean,
  newStory: StoryType,
  nlu: ExampleType[],
  actions: string[],
  onSetNewStory: (story: StoryType) => void,
  onClickSaveBtn: (story: StoryType) => void,
};

const CreateStory: React.FC<CreateStoryProps> = (props) => {
  const { isCreate, newStory, nlu, actions, onSetNewStory, onClickSaveBtn } =
    props;
  const { stories } = useStoryStore((state: State) => {
    return {
      stories: state.stories,
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
        ? !!newStory.steps[newStory.steps.length - 1].intent
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
  const atEditUserSay = React.useCallback(
    (oriUserSay: string, userSay: string) => {
      // 驗證使用者對話是否重複
      const repeat = [];
      nlu.map((nluItem) =>
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
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
            if (step.user === oriUserSay && step.intent === oriUserSay) {
              step.user = userSay;
              step.intent = userSay;
            } else {
              step.user = userSay;
            }
            return step;
          }),
        };
      });
    },
    [onSetNewStory, nlu, newStory],
  );

  // 編輯意圖
  const atEditIntent = React.useCallback(
    (oriIntent: string, intent: string) => {
      const repeat = [];
      nlu.map((nluItem) =>
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
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
            if (step.intent === oriIntent) {
              step.intent = intent;
            }
            return step;
          }),
        };
      });
    },
    [onSetNewStory, nlu, newStory],
  );

  // 編輯例句
  const atEditExamples = React.useCallback(
    (userSay: string, intent: string, examples: string) => {
      const newExamples = examples
        .split(',')
        .map((example) => example.trimStart())
        .map((example) => example.trimEnd())
        .filter((example) => example !== '');
      const repeat = [];
      // 驗證例句是否重複
      newExamples.map((example) => {
        // 驗證所有例句
        nlu.map((nluItem) =>
          nluItem.text === example ? repeat.push(example) : nluItem,
        );

        // 驗證目前新增故事
        newStory.steps.map((step) => {
          if (step.user === example) {
            repeat.push(example);
          } else if (step.intent !== intent) {
            step.examples?.map((stepExample) =>
              stepExample === example ? repeat.push(example) : example,
            );
          }
          return step;
        });
        return example;
      });
      if (repeat.length) {
        return Toast.fire({
          title: '以下例句重複',
          text: `${repeat.toString()}`,
          icon: 'warning',
        });
      }
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
            if (step.intent === intent) {
              step.examples = examples
                .split(',')
                .map((example) => example.trimStart())
                .map((example) => example.trimEnd())
                .filter((example) => example !== '');
            }
            return step;
          }),
        };
      });
    },
    [onSetNewStory, nlu, newStory],
  );

  // 新增關鍵字
  const atCreateEntities = React.useCallback(
    (entities: NluEntitiesType, intent: string) => {
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
            if (step.intent === intent) {
              step.entities.push(entities);
              step.entities.sort((a, b) => a.start - b.start);
            }
            return step;
          }),
        };
      });
    },
    [onSetNewStory],
  );

  // 刪除關鍵字
  const atDeleteEntities = React.useCallback(
    (entity: string, intent: string) => {
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
            if (step.intent === intent && step.entities.length) {
              const entitiesKeys = step.entities.map((item) => item.entity);
              step.entities.splice(entitiesKeys.indexOf(entity), 1);
            }
            return step;
          }),
        };
      });
    },
    [onSetNewStory],
  );

  // 編輯關鍵字位置
  const atEditEntityShowValue = React.useCallback(
    (stepIntent: string, entityValue: string, newEntityShowValue: string) => {
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
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
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
        };
      });
    },
    [onSetNewStory, newStory],
  );

  // 編輯關鍵字代表值
  const atEditEntity = React.useCallback(
    (stepIntent: string, oriEntity: string, newEntity: string) => {
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

      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
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
        };
      });
    },
    [onSetNewStory, newStory.steps],
  );

  // 編輯關鍵字
  const atEditEntityValue = React.useCallback(
    (stepIntent: string, oriEntityValue: string, newEntityValue: string) => {
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

      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
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
        };
      });
    },
    [onSetNewStory, newStory.steps],
  );

  // 編輯機器人回覆
  const atEditBotRes = React.useCallback(
    (oriBotRes: string, botRes: string, action: string) => {
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.map((step) => {
            if (
              step.action &&
              step.action === action &&
              step.response === oriBotRes
            ) {
              step.response = botRes;
            }
            return step;
          }),
        };
      });
    },
    [onSetNewStory],
  );

  // 刪除使用者步驟
  const atRemoveUserStep = React.useCallback(
    (intent: string, userSay: string) => {
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.filter(
            (step) => step.intent !== intent && step.user !== userSay,
          ),
        };
      });
    },
    [onSetNewStory],
  );

  // 刪除機器人步驟
  const atRemoveBotStep = React.useCallback(
    (action: string) => {
      return onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.filter((step) => step.action !== action),
        };
      });
    },
    [onSetNewStory],
  );

  // 增加機器人回覆選項
  const atAddResButtons = React.useCallback(
    (action: string, title: string, payload: string, reply: string) => {
      return onSetNewStory((prev) => {
        const steps = prev.steps.map((step) => {
          if (step.action === action) {
            const isInStory = stories.some(
              (item) => item.story === `button_${title}`,
            );
            const isExist = step.buttons?.some(
              (button) => button.title === title,
            );

            if (isExist || isInStory) {
              Toast.fire({
                icon: 'warning',
                title: '此選項已存在',
              });
            } else if (step.buttons) {
              step.buttons.push({ title, payload, reply });
            } else {
              step.buttons = [{ title, payload, reply }];
            }
          }
          return step;
        });
        return {
          ...prev,
          steps,
        };
      });
    },
    [onSetNewStory, stories],
  );

  // 編輯機器人選項
  const atEditResButtons = React.useCallback(
    (
      action: string,
      title: string,
      oriPayload: string,
      payload: string,
      reply: string,
    ) => {
      return onSetNewStory((prev) => {
        const steps = prev.steps.map((step) => {
          if (step.action === action) {
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
        });
        return {
          ...prev,
          steps,
        };
      });
    },
    [onSetNewStory],
  );

  // 刪除機器人選項
  const atRemoveResButton = React.useCallback(
    (action: string, payload: string) => {
      return onSetNewStory((prev) => {
        const steps = prev.steps.map((step) => {
          if (step.action === action) {
            step.buttons = step.buttons.filter(
              (button) => button.payload !== payload,
            );
          }
          return step;
        });
        return {
          ...prev,
          steps,
        };
      });
    },
    [onSetNewStory],
  );

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
        {newStory.steps.length !== 0 &&
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
            } = step;
            return step.intent ? (
              <UserStep
                key={step.intent}
                isCreate={isCreate}
                step={{ intent, user, entities, examples }}
                storyName={newStory.story}
                onEditUserSay={atEditUserSay}
                onEditExamples={atEditExamples}
                onEditIntent={atEditIntent}
                onRemoveUserStep={atRemoveUserStep}
                onCreateEntities={atCreateEntities}
                onEditEntityShowValue={atEditEntityShowValue}
                onEditEntity={atEditEntity}
                onEditEntityValue={atEditEntityValue}
                onDeleteEntities={atDeleteEntities}
              />
            ) : (
              <BotStep
                key={step.action}
                isCreate={isCreate}
                step={{ action, response, buttons }}
                storyName={newStory.story}
                onEditBotRes={atEditBotRes}
                onRemoveBotStep={atRemoveBotStep}
                onAddResButtons={atAddResButtons}
                onEditResButtons={atEditResButtons}
                onRemoveResButton={atRemoveResButton}
              />
            );
          })}
        {CurStepAlert}
      </div>
      <StepControl
        onSetNewStory={onSetNewStory}
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
