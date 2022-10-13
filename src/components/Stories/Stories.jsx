import * as React from 'react';
// import useSWR from 'swr';
import {
  fetchAllData,
  putExamples,
  putUserSay,
  putBotResponse,
  deleteStory,
} from 'services/api';
import shallow from 'zustand/shallow';
import type { State } from 'components/types';
import ShowStory from 'components/ShowStory';
import cx from 'classnames';
// import MyButton from 'components/MyButton';
import { Toast, confirmWidget } from 'utils/swalInput';
import { Link } from 'react-router-dom';
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

  // 進入頁面獲取設定資料
  React.useEffect(() => {
    fetchAllData().then((data) => onSetAllTrainData(data));

    // 離開頁面將story設為空
    return () => {
      onSetStory('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 編輯使用者例句
  const atEditExamples = React.useCallback(
    (intent: string, examples: string, storyName: string) => {
      putExamples(intent, examples, storyName).then((res) => {
        if (res.status === 'success') {
          fetchAllData()
            .then((data) => onSetAllTrainData(data))
            .then(() => {
              onSetStory(storyName);
              return Toast.fire({
                icon: 'success',
                title: '編輯成功',
              });
            });
        }
        Toast.fire({
          icon: 'error',
          title: '編輯失敗',
          text: res.message,
        });
      });
    },
    [onSetStory, onSetAllTrainData],
  );

  // 編輯使用者對話
  const atEditUserSay = React.useCallback(
    (oriUserSay: string, userSay: string, storyName: string) => {
      putUserSay(oriUserSay, userSay, storyName).then((res) => {
        if (res.status === 'success') {
          fetchAllData()
            .then((data) => onSetAllTrainData(data))
            .then(() => {
              onSetStory(storyName);
              return Toast.fire({
                icon: 'success',
                title: '編輯成功',
              });
            });
        }
        Toast.fire({
          icon: 'error',
          title: '編輯失敗',
          text: res.message,
        });
      });
    },
    [onSetAllTrainData, onSetStory],
  );

  // 編輯機器人回覆
  const atEditBotRes = React.useCallback(
    (oriBotRes: string, botRes: string, storyName: string, action: string) => {
      putBotResponse(oriBotRes, botRes, storyName, action).then((res) => {
        if (res.status === 'success') {
          fetchAllData()
            .then((data) => onSetAllTrainData(data))
            .then(() => {
              onSetStory(storyName);
              return Toast.fire({
                icon: 'success',
                title: '編輯成功',
              });
            });
        }
        Toast.fire({
          icon: 'error',
          title: '編輯失敗',
          text: res.message,
        });
      });
    },
    [onSetAllTrainData, onSetStory],
  );

  // 刪除故事
  const atDeleteStory = React.useCallback(
    (storyName: string) => {
      confirmWidget(storyName).then((result) => {
        if (!result.isConfirmed) return;
        deleteStory(storyName).then((res) => {
          if (res.status === 'success') {
            fetchAllData()
              .then((data) => onSetAllTrainData(data))
              .then(() => {
                onSetStory('');
                return Toast.fire({
                  icon: 'success',
                  title: '故事刪除成功',
                });
              });
          }
          Toast.fire({
            icon: 'error',
            title: '故事刪除失敗',
            text: res.message,
          });
        });
      });
    },
    [onSetAllTrainData, onSetStory],
  );

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
                <Link to="/stories/create" className="btn btn-warning">
                  新增故事流程
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div id="data-panel" />
        {Object.keys(story).length !== 0 && (
          <ShowStory
            story={story}
            onEditExamples={atEditExamples}
            onEditUserSay={atEditUserSay}
            onEditBotRes={atEditBotRes}
            onDeleteStory={atDeleteStory}
          />
        )}
        <hr />
      </div>
    </div>
  );
};

export default React.memo(Stories);
