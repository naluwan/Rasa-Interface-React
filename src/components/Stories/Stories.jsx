/* eslint-disable no-shadow */
import * as React from 'react';
import useSWR from 'swr';
import {
  fetchAllData,
  putExamples,
  // putUserSay,
  putBotResponse,
  deleteStory,
  postTrainData,
} from 'services/api';
import shallow from 'zustand/shallow';
// eslint-disable-next-line no-unused-vars
import type { State, StoryType } from 'components/types';
import ShowStory from 'components/ShowStory';
import cx from 'classnames';
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
   * @type {[StoryType, Function]}
   */
  const [newStory, setNewStory] = React.useState({});
  const {
    story,
    stories,
    nlu,
    cloneData,
    onSetStory,
    onSetAllTrainData,
    onCreateNewStory,
    onEditUserSay,
  } = useStoryStore((state: State) => {
    return {
      story: state.story,
      stories: state.stories,
      nlu: state.nlu,
      domain: state.domain,
      cloneData: state.cloneData,
      onSetStory: state.onSetStory,
      onSetAllTrainData: state.onSetAllTrainData,
      onCreateNewStory: state.onCreateNewStory,
      onEditUserSay: state.onEditUserSay,
    };
  }, shallow);

  // 進入頁面打API要所有訓練資料
  const { data } = useSWR('/api/getAllTrainData', fetchAllData);
  // 進入頁面獲取設定資料
  React.useEffect(() => {
    onSetAllTrainData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // 離開頁面將顯示故事刪除
  React.useEffect(() => {
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
      onEditUserSay(oriUserSay, userSay, storyName);

      postTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '編輯失敗',
            text: res.message,
          });
        }
        onSetAllTrainData(res.data);
        return onSetStory(storyName);
      });
    },
    [onEditUserSay, cloneData, onSetStory, onSetAllTrainData],
  );

  // 編輯機器人回覆
  const atEditBotRes = React.useCallback(
    (oriBotRes: string, botRes: string, action: string, storyName: string) => {
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
      if (Object.keys(newStory).length !== 0) {
        return confirmWidget(newStory.story, null).then((result) => {
          if (!result.isConfirmed) return;
          onSetStory(storyName);
          setCreate(false);
          setDefaultValue(storyName);
          setNewStory({});
        });
      }
      onSetStory(storyName);
      setCreate(false);
      setDefaultValue(storyName);
      return setNewStory({});
    },
    [onSetStory, newStory],
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

  // 新增故事點擊儲存按鈕
  const atClickSaveBtn = React.useCallback(
    (story: StoryType) => {
      // 資料更新
      onCreateNewStory(story);

      // 將修改過的cloneData打進API回資料庫
      postTrainData(cloneData).then((res) => {
        if (res.status !== 'success') {
          return Toast.fire({
            icon: 'error',
            title: '新增資料異常',
            text: res.message,
          });
        }
        // 導回故事瀏覽頁面
        onSetAllTrainData(res.data);
        setCreate(false);
        setNewStory({});
        setDefaultValue(story.story);
        return onSetStory(story.story);
      });
    },
    [onSetStory, cloneData, onCreateNewStory, onSetAllTrainData],
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
          <CreateStory
            storyName={newStory.story}
            newStory={newStory}
            onSetNewStory={setNewStory}
            nlu={nlu.rasa_nlu_data.common_examples}
            onClickSaveBtn={atClickSaveBtn}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(Stories);
