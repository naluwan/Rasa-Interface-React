import * as React from 'react';
// import shallow from 'zustand/shallow';
// import type { State } from 'components/types';
import UserStep from 'components/UserStep';
import BotStep from 'components/BotStep';
// import cx from 'classnames';
import style from './ShowStory.module.scss';
// import useStoryStore from '../../store/useStoryStore';
import { StoryType } from '../types';

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
  const { story, onEditExamples, onEditUserSay, onEditBotRes, onDeleteStory } =
    props;

  return (
    <div className={style.root}>
      <h3 className={style.title}>{story.story}</h3>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => onDeleteStory(story.story)}
      >
        刪除故事
      </button>
      <div className={style.stepsPanel}>
        {story.steps.map((step) => {
          return step.intent ? (
            <UserStep
              key={step.intent}
              step={step}
              storyName={story.story}
              onEditExamples={onEditExamples}
              onEditUserSay={onEditUserSay}
            />
          ) : (
            <BotStep
              key={step.action}
              step={step}
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
