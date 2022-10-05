import * as React from 'react';
import shallow from 'zustand/shallow';
import type { State } from 'components/types';
import UserStep from 'components/UserStep';
import BotStep from 'components/BotStep';
// import cx from 'classnames';
import style from './ShowStory.module.scss';
import useStoryStore from '../../store/useStoryStore';

const ShowStory = () => {
  const { story } = useStoryStore((state: State) => {
    return {
      story: state.story,
    };
  }, shallow);

  return (
    <div className={style.root}>
      <h3 className={style.title}>{story.story}</h3>
      <div className={style.stepsPanel}>
        {story.steps.map((step) => {
          return step.intent ? (
            <UserStep key={step.intent} step={step} />
          ) : (
            <BotStep key={step.action} step={step} />
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(ShowStory);
