import * as React from 'react';
import cx from 'classnames';
import MyButton from 'components/MyButton';
import useSWR from 'swr';
import { fetchStories } from 'services/api';
import style from './Stories.module.scss';

const Stories: React.FC<StoriesProps> = () => {
  const { data } = useSWR('/api/stories', fetchStories);

  const stories = data?.stories;

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
                required=""
              >
                {stories &&
                  stories.map((item) => (
                    <option key={item.story} value={item.story}>
                      {item.story}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="col-1">
            <MyButton
              className="btn"
              variant="primary"
              // onClick={() => selectSore()}
            >
              查詢
            </MyButton>
          </div>
        </div>
        <div id="data-panel" />
        <br />
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
