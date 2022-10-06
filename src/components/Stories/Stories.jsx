import * as React from 'react';
import cx from 'classnames';
import MyButton from 'components/MyButton';
import useSWR from 'swr';
import { fetchStories } from 'services/api';
import shallow from 'zustand/shallow';
import type { State } from 'components/types';
import ShowStory from 'components/ShowStory';
import style from './Stories.module.scss';
import useStoryStore from '../../store/useStoryStore';

const Stories = () => {
  const { story, stories, setStory, setStories } = useStoryStore(
    (state: State) => {
      return {
        story: state.story,
        stories: state.stories,
        setStory: state.setStory,
        setStories: state.setStories,
      };
    },
    shallow,
  );
  const { data } = useSWR('/api/stories', fetchStories);

  const storiesData = data?.stories;

  React.useEffect(() => {
    setStories(storiesData);
  }, [storiesData, setStories]);
  // const atSelect = React.useCallback(
  //   (stories: StoryType[], e: Event) => {
  //     setStory(stories, e.target.value);
  //   },
  //   [setStory],
  // );
  console.log(stories);

  return (
    <div>
      <div>
        <div className={style.searchBar}>
          <div className="row">
            <div className="col-2">
              <h4 className={style.searchTitle}>故事流程</h4>
            </div>
            <div className="col-4">
              <div className={style.senderId}>
                <div>故事名稱：</div>
                <select
                  id="stories"
                  className={style.storiesSelector}
                  onChange={(e) => setStory(e.target.value)}
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
        </div>
        <div id="data-panel" />
        <br />
        {Object.keys(story).length !== 0 && <ShowStory currentStory={story} />}
        {/* {Object.keys(story).length !== 0 && (
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
        )} */}
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
