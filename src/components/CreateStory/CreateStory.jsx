import * as React from 'react';
import { Toast } from 'utils/swalInput';
import shallow from 'zustand/shallow';
import style from './CreateStory.module.scss';
import StepControl from './StepControl';
import UserStep from '../UserStep';
import BotStep from '../BotStep';
import type { StoryType, ExampleType, State } from '../types';
import useStoryStore from '../../store/useStoryStore';

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

  React.useEffect(() => {
    // 雙驚嘆號為判斷是否存在，只返回boolean
    setIsUser(
      newStory.steps.length
        ? !!newStory.steps[newStory.steps.length - 1].intent
        : false,
    );
  }, [setIsUser, newStory]);

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
            if (step.user === oriUserSay) {
              step.user = userSay;
              step.intent = userSay;
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
    (intent: string, examples: string) => {
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
                onRemoveUserStep={atRemoveUserStep}
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
      </div>
      <StepControl
        onSetNewStory={onSetNewStory}
        isUser={isUser}
        nlu={nlu}
        steps={newStory.steps}
        actions={actions}
      />
    </div>
  );
};

export default React.memo(CreateStory);
