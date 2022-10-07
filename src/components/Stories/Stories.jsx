import * as React from 'react';
import cx from 'classnames';
import MyButton from 'components/MyButton';
import useSWR from 'swr';
import { fetchAllData } from 'services/api';
import shallow from 'zustand/shallow';
import type { State } from 'components/types';
import ShowStory from 'components/ShowStory';
import style from './Stories.module.scss';
import useStoryStore from '../../store/useStoryStore';

const Stories = () => {
  const { story, stories, onSetStory, onSetAllTrainData } = useStoryStore(
    (state: State) => {
      return {
        story: state.story,
        stories: state.stories,
        onSetStory: state.onSetStory,
        onSetAllTrainData: state.onSetAllTrainData,
      };
    },
    shallow,
  );

  const { data } = useSWR('/api/train/allTrainData', fetchAllData);

  React.useEffect(() => {
    onSetAllTrainData(data);
  }, [data, onSetAllTrainData]);

  return (
    <div>
      <div>
        <h1>故事流程</h1>

        <div className="col-4">
          <div className={style.senderId}>
            <div>故事名稱：</div>
            <select
              id="stories"
              className={style.storiesSelector}
              onChange={(e) => onSetStory(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled hidden>
                請選擇
              </option>
              {stories &&
                stories.map((item) => (
                  <option key={item.story} value={item.story}>
                    {item.story}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div id="data-panel" />
        <br />
        {Object.keys(story).length !== 0 && <ShowStory currentStory={story} />}
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
