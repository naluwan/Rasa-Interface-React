import * as React from 'react';
import style from './CreateStory.module.scss';
import StepControl from './StepControl';
import UserStep from '../UserStep';
import BotStep from '../BotStep';
// eslint-disable-next-line no-unused-vars
import { StoryType } from '../types';

type CreateStoryProps = {
  storyName: string,
  newStory: StoryType,
  onSetNewStory: (story: StoryType) => void,
};

const CreateStory: React.FC<CreateStoryProps> = (props) => {
  const { storyName, newStory, onSetNewStory } = props;
  const [isUser, setIsUser] = React.useState(false);

  React.useEffect(() => {
    setIsUser(
      newStory.steps.length
        ? !!newStory.steps[newStory.steps.length - 1].intent
        : false,
    );
  }, [setIsUser, newStory.steps]);
  console.log(newStory);

  const atEditUserSay = React.useCallback(
    (oriUserSay: string, userSay: string) => {
      onSetNewStory((prev) => {
        const steps = prev.steps.map((step) => {
          if (step.user === oriUserSay) {
            step.user = userSay;
            step.intent = userSay;
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
        <button type="button" className="btn btn-secondary mx-4">
          儲存
        </button>
      </div>
      <div className={style.stepsPanel} id="stepsPanel">
        {newStory.steps.length !== 0 &&
          newStory.steps.map((step) => {
            return step.intent ? (
              <UserStep
                step={step}
                storyName={storyName}
                onEditUserSay={atEditUserSay}
              />
            ) : (
              <BotStep step={step} storyName={storyName} />
            );
          })}
      </div>
      <StepControl onSetNewStory={onSetNewStory} isUser={isUser} />
    </div>
  );
};

export default React.memo(CreateStory);
