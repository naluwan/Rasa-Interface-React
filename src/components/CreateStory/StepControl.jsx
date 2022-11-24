import * as React from 'react';
import cx from 'classnames';
import { Toast } from 'utils/swalInput';
import Swal from 'sweetalert2';
import style from './StepControl.module.scss';
import { StoryType, ExampleType, StepsType } from '../types';
import { randomBotResAction } from '../../utils/randomBotResAction';

type StepControlType = {
  isUser: boolean,
  nlu: ExampleType[],
  stories: StoryType[],
  newStory: StoryType,
  steps: StepsType,
  actions: string[],
  onSetNewStory: (story: StoryType) => void,
  onSetIsInputFocus: () => void,
};

const StepControl: React.FC<StepControlType> = (props) => {
  const {
    isUser,
    nlu,
    stories,
    newStory,
    steps,
    actions,
    onSetNewStory,
    onSetIsInputFocus,
  } = props;
  /**
   * @type {[string, Function]}
   */
  const [conversation, setConversation] = React.useState('');

  // 獲取輸入框文字
  const atChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setConversation(e.target.value);
    },
    [setConversation],
  );

  // 點擊使用者按鈕
  const atUserStep = React.useCallback(
    (userSay: string) => {
      if (!userSay) return;
      const repeat = [];
      nlu.map((nluItem) =>
        nluItem.text === userSay ? repeat.push(userSay) : nluItem,
      );
      steps.map((step) =>
        step.user === userSay ? repeat.push(userSay) : step,
      );
      if (repeat.length) {
        Toast.fire({
          icon: 'warning',
          title: `使用者對話『${userSay}』重複`,
        });
        setConversation('');
        return;
      }
      onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.concat([
            { user: userSay, intent: userSay, entities: [], examples: [] },
          ]),
        };
      });
      setConversation('');
    },
    [onSetNewStory, nlu, steps],
  );

  // 點擊機器人按鈕
  const atBotStep = React.useCallback(
    (botRes: string) => {
      if (!botRes) return;
      const actionName = randomBotResAction(actions);

      onSetNewStory((prev) => {
        return {
          ...prev,
          steps: prev.steps.concat([{ action: actionName, response: botRes }]),
        };
      });

      setConversation('');
    },
    [onSetNewStory, actions],
  );

  // 點擊新增支線故事按鈕
  const atCheckPointStep = React.useCallback(
    async (storiesData: StoryType[], newStoryData: StoryType) => {
      await Swal.fire({
        title: '新增支線故事',
        html: `
        <input type="text" id="branchName" class="swal2-input" placeholder="請輸入支線故事名稱" />
      `,
        showCancelButton: true,
        showCloseButton: true,
        preConfirm: () => {
          return new Promise((resolve) => {
            Swal.enableButtons();
            const branchName = document.querySelector(
              '.swal2-input#branchName',
            ).value;

            if (branchName === '') return;

            let isRepeat = false;

            // 驗證支線事故名稱是否已存在
            isRepeat = storiesData.some((item) => item.story === branchName);

            if (isRepeat) {
              Swal.showValidationMessage(`支線故事名稱重複`);
              return;
            }

            // 驗證支線故事是否後目前新增的故事名稱重複
            isRepeat = newStoryData.story === branchName;

            if (isRepeat) {
              Swal.showValidationMessage(`支線故事名稱重複`);
              return;
            }

            // 驗證目前新增故事中的支線故事是否重複
            isRepeat = newStoryData.steps.some((step) => {
              if (step.checkpoint && step.branchStories.length) {
                return step.branchStories.some((branchStory) => {
                  const curName = branchStory.story.slice(
                    branchStory.story.lastIndexOf('_') + 1,
                    branchStory.story.length,
                  );

                  if (curName === branchName) {
                    return true;
                  }
                  return false;
                });
              }
              return false;
            });

            if (isRepeat) {
              Swal.showValidationMessage(`支線故事名稱重複`);
              return;
            }

            resolve({ branchName });
          }).catch((err) => {
            Toast.fire({
              icon: 'warning',
              title: err.message,
            });
          });
        },
      }).then((result) => {
        if (result.isConfirmed) {
          onSetNewStory((prev) => {
            const isCheckPointExist = prev.steps.some(
              (step) => step.checkpoint,
            );
            if (!isCheckPointExist) {
              return {
                ...prev,
                steps: prev.steps.concat([
                  {
                    checkpoint: `${prev.story}_主線`,
                    branchStories: [
                      {
                        story: `${prev.story}_${result.value.branchName}`,
                        steps: [{ checkpoint: `${prev.story}_主線` }],
                      },
                    ],
                  },
                ]),
              };
            }
            return {
              ...prev,
              steps: prev.steps.map((step) => {
                if (step.checkpoint) {
                  step.branchStories = step.branchStories.concat([
                    {
                      story: `${prev.story}_${result.value.branchName}`,
                      steps: [{ checkpoint: `${prev.story}_主線` }],
                    },
                  ]);
                }
                return step;
              }),
            };
          });
        }
      });
    },
    [onSetNewStory],
  );

  return (
    <div className="d-flex px-3 justify-content-start">
      <textarea
        className={cx('col-9', style.stepTextarea)}
        type="text"
        name="conversation"
        placeholder="輸入完對話後，請點擊左側步驟按鈕"
        onChange={atChange}
        value={conversation}
        rows={1}
        onFocus={() =>
          onSetIsInputFocus((prev) => (prev === undefined ? true : !prev))
        }
        onBlur={() => onSetIsInputFocus(undefined)}
      />
      <div className="col-2 mx-3 d-flex flex-column align-items-center">
        <div className="col-11 d-flex justify-content-around mb-1">
          <button
            className="btn btn-success"
            onClick={() => atUserStep(conversation)}
            disabled={isUser}
          >
            使用者
          </button>
          <button
            className="btn btn-primary"
            onClick={() => atBotStep(conversation)}
            disabled={!isUser}
          >
            機器人
          </button>
        </div>
        <button
          className="btn btn-warning mx-1 col-10"
          onClick={() => atCheckPointStep(stories, newStory)}
          disabled={!isUser}
        >
          新增支線故事
        </button>
      </div>
    </div>
  );
};

export default React.memo(StepControl);
