import * as React from 'react';
import useSWR from 'swr';
import { fetchAllData } from 'services/api';
import shallow from 'zustand/shallow';
import type { State } from 'components/types';
import ShowStory from 'components/ShowStory';
import cx from 'classnames';
import MyButton from 'components/MyButton';
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
        <div className={style.searchBar}>
          <div>
            <div className={style.senderId}>
              <h4 className={style.searchTitle}>故事流程</h4>
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
              <div className={cx('btn', style.navbar)}>
                <MyButton variant="third">新增故事流程</MyButton>
              </div>
            </div>
          </div>
        </div>
        <div id="data-panel" />
        {Object.keys(story).length !== 0 && <ShowStory currentStory={story} />}
        <hr />
      </div>
    </div>
  );
};

export default React.memo(Stories);
