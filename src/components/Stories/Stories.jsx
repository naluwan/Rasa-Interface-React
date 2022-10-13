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
// eslint-disable-next-line no-unused-vars
import type { State, StoryType } from 'components/types';
import ShowStory from 'components/ShowStory';
import cx from 'classnames';
// import MyButton from 'components/MyButton';
import { Toast, confirmWidget, swalInput } from 'utils/swalInput';
import MyButton from 'components/MyButton';
import CreateStory from 'components/CreateStory';
import style from './Stories.module.scss';
import useStoryStore from '../../store/useStoryStore';

const Stories = () => {
  /**
   * @type {[boolean, Function]}
   */
  const [create, setCreate] = React.useState(false);
  /**
   * @type {[string, Function]}
   */
  const [defaultValue, setDefaultValue] = React.useState('');
  /**
   * @type {[string, Function]}
   */
  // const [newStoryName, setNewStoryName] = React.useState('');
  /**
   * @type {[StoryType, Function]}
   */
  const [newStory, setNewStory] = React.useState({});
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
      confirmWidget(storyName, 'delete').then((result) => {
        if (!result.isConfirmed) return;
        deleteStory(storyName).then((res) => {
          if (res.status === 'success') {
            fetchAllData()
              .then((data) => onSetAllTrainData(data))
              .then(() => {
                onSetStory('');
                setDefaultValue('');
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

  // 選擇故事
  const atSelectStory = React.useCallback(
    (storyName: string) => {
      onSetStory(storyName);
      setCreate(false);
      setDefaultValue(storyName);
      setNewStory({});
    },
    [onSetStory],
  );

  // 新增故事
  const atClickCreateStoryBtn = React.useCallback(() => {
    if (Object.keys(newStory).length !== 0) {
      return confirmWidget(newStory.story, null).then((result) => {
        if (!result.isConfirmed) return;
        swalInput('設定故事名稱', 'text', '請輸入故事名稱', '', true).then(
          (createStoryName) => {
            if (!createStoryName) return;
            const repeat = [];
            stories.map((item) => {
              return item.story === createStoryName ? repeat.push(item) : item;
            });
            if (repeat.length) {
              Toast.fire({
                icon: 'warning',
                title: '故事名稱重複',
              });
              return;
            }
            setNewStory({ story: createStoryName, steps: [] });
            onSetStory('');
            setCreate(true);
            setDefaultValue('');
          },
        );
      });
    }
    return swalInput('設定故事名稱', 'text', '請輸入故事名稱', '', true).then(
      (createStoryName) => {
        if (!createStoryName) return;
        const repeat = [];
        stories.map((item) => {
          return item.story === createStoryName ? repeat.push(item) : item;
        });
        if (repeat.length) {
          Toast.fire({
            icon: 'warning',
            title: '故事名稱重複',
          });
          return;
        }
        setNewStory({ story: createStoryName, steps: [] });
        onSetStory('');
        setCreate(true);
        setDefaultValue('');
      },
    );
  }, [newStory, onSetStory, stories]);

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
                onChange={(e) => atSelectStory(e.target.value)}
                value={defaultValue}
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
                <MyButton variant="third" onClick={atClickCreateStoryBtn}>
                  新增故事流程
                </MyButton>
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
        {create && (
          <CreateStory newStory={newStory} onSetNewStory={setNewStory} />
        )}
      </div>
    </div>
  );
};

export default React.memo(Stories);
