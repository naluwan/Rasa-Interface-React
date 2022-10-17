import * as React from 'react';
import shallow from 'zustand/shallow';
import UserStep from 'components/UserStep';
import BotStep from 'components/BotStep';
import style from './ShowStory.module.scss';
import type { StoryType, State } from '../types';
import useStoryStore from '../../store/useStoryStore';

type ShowStoryProps = {
  story: StoryType,
  onEditExamples: (intent: string, examples: string, storyName: string) => void,
  onEditUserSay: (
    oriUserSay: string,
    userSay: string,
    storyName: string,
  ) => void,
  onEditBotRes: (
    oriBotRes: string,
    botRes: string,
    storyName: string,
    action: string,
  ) => void,
  onDeleteStory: (storyName: string) => void,
};

const ShowStory: React.FC<ShowStoryProps> = (props) => {
  const { story, onEditExamples, onEditUserSay, onDeleteStory } = props;
  const { onEditBotRes } = useStoryStore((state: State) => {
    return {
      onEditBotRes: state.onEditBotRes,
    };
  }, shallow);

  return (
    <div className={style.root}>
      <div className="col d-flex align-items-center">
        <div className={style.title}>{story.story}</div>
        {story.story !== '問候語' && (
          <button
            type="button"
            className="btn btn-danger mx-4"
            onClick={() => onDeleteStory(story.story)}
          >
            刪除故事
          </button>
        )}
      </div>
      <div className={style.stepsPanel}>
        {story.steps.map((step) => {
          const { intent, user, entities, examples, action, response } = step;
          return step.intent ? (
            <UserStep
              key={step.intent}
              step={{ intent, user, entities, examples }}
              storyName={story.story}
              onEditExamples={onEditExamples}
              onEditUserSay={onEditUserSay}
            />
          ) : (
            <BotStep
              key={step.action}
              step={{ action, response }}
              storyName={story.story}
              onEditBotRes={onEditBotRes}
            />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(ShowStory);
