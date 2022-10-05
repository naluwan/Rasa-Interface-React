import * as React from 'react';
import cx from 'classnames';
import MyButton from 'components/MyButton';
import useSWR from 'swr';
import { fetchStories } from 'services/api';
import shallow from 'zustand/shallow';
import type { StoryType } from 'components/types';
import style from './Stories.module.scss';
import useStore from '../../store';

const Stories = () => {
  const { story, setStory } = useStore((state) => {
    return {
      story: state.story,
      setStory: state.setStory,
    };
  }, shallow);
  const { data } = useSWR('/api/stories', fetchStories);

  const storiesData = data?.stories;

  const atSelect = React.useCallback(
    (stories: StoryType[], e: Event) => {
      setStory(stories, e.target.value);
    },
    [setStory],
  );

  return (
    <div>
      <div>
        <h1>故事流程</h1>
        <div className="row">
          <div className="col-4">
            <div className={style.senderId}>
              <div>故事名稱：</div>
              <select
                id="stories"
                className={style.storiesSelector}
                onChange={(e) => atSelect(storiesData, e)}
                defaultValue=""
              >
                <option value="" disabled hidden>
                  請選擇
                </option>
                {storiesData &&
                  storiesData.map((item) => (
                    <option key={item.story} value={item.story}>
                      {item.story}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
        <div id="data-panel" />
        <br />
        {Object.keys(story).length !== 0 && (
          <>
            <hr />
            <div>{story.story}</div>
            {story.steps.map((step) => {
              return step.intent ? (
                <React.Fragment key={step.intent}>
                  <h5>user</h5>
                  <div>{step.user}</div>
                  <div>intent:{step.intent}</div>
                  {step.examples.length && (
                    <div>
                      examples:
                      {step.examples.map((example) => (
                        <p key={example}>{example}</p>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              ) : (
                <React.Fragment key={step.action}>
                  <h5>bot</h5>
                  <div>{step.action}</div>
                  <div>{step.response}</div>
                </React.Fragment>
              );
            })}
          </>
        )}
        <hr />
        <div className={cx(style.center, 'col-2')}>
          <MyButton className="btn" variant="third">
            新增故事流程
          </MyButton>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Stories);
