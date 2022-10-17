/* eslint-disable no-shadow */
import * as React from 'react';
import useSWR from 'swr';
import { fetchAllData, deleteStory, postAllTrainData } from 'services/api';
import shallow from 'zustand/shallow';
// eslint-disable-next-line no-unused-vars
import type { State, StoryType } from 'components/types';
import ShowStory from 'components/ShowStory';
import cx from 'classnames';
import { Toast, confirmWidget, swalInput } from 'utils/swalInput';
import MyButton from 'components/MyButton';
import CreateStory from 'components/CreateStory';
import { cloneDeep } from 'lodash-es';
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
  const { story, stories, nlu, cloneData, onSetStory, onSetAllTrainData } =
    useStoryStore((state: State) => {
      return {
        story: state.story,
        stories: state.stories,
        nlu: state.nlu,
        domain: state.domain,
        cloneData: state.cloneData,
        onSetStory: state.onSetStory,
        onSetAllTrainData: state.onSetAllTrainData,
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
  const atClickSaveBtn = React.useCallback(() => {
    // 資料更新
    const userStep = [];
    const botStep = [];
    // 驗證步驟是否正確
    newStory.steps.map((step) =>
      step.intent ? userStep.push(step) : botStep.push(step),
    );
    if (userStep.length === 0) {
      return Toast.fire({
        icon: 'warning',
        title: '使用者對話是必填的',
      });
    }
    if (botStep.length === 0) {
      return Toast.fire({
        icon: 'warning',
        title: '機器人回覆是必填的',
      });
    }
    // 組成例句的訓練檔格式
    const currentExamples = newStory.steps
      .filter((step) => step.examples)
      .map((step) => ({ intent: step.intent, examples: step.examples }));

    // 將例句訓練檔放進nlu訓練檔中
    // 將意圖放進domain訓練檔的intents中
    currentExamples.map((exampleItem) => {
      return exampleItem.examples.map((example) => {
        return cloneData.nlu.rasa_nlu_data.common_examples.push({
          text: example,
          intent: exampleItem.intent,
          entities: [],
        });
      });
    });

    // 組成機器人回覆的訓練檔格式
    const currentAction = newStory.steps
      .filter((step) => step.action)
      .map((step) => ({
        action: step.action,
        text: step.response,
      }));

    // 將機器人回覆放進domain訓練檔中
    currentAction.map((actionItem) => {
      cloneData.domain.responses[actionItem.action] = [
        { text: actionItem.text },
      ];
      return cloneData.domain.actions.push(actionItem.action);
    });

    // 在完成儲存動作之前還需要newStory，所以需要深層複製，否則後面某些物件資料後，會有問題
    const cloneNewStory = cloneDeep(newStory);

    // 組成故事流程的訓練檔格式
    cloneNewStory.steps = cloneNewStory.steps.map((step) => {
      if (step.intent) {
        delete step.examples;
      }
      if (step.action) {
        delete step.response;
      }
      return step;
    });

    cloneData.stories.push(cloneNewStory);

    // 將使用者對話加入nlu和domain訓練檔中
    cloneNewStory.steps.map((step) => {
      if (step.intent) {
        cloneData.nlu.rasa_nlu_data.common_examples.push({
          text: step.user,
          intent: step.intent,
          entities: [],
        });
        cloneData.domain.intents.push(step.intent);
      }
      return step;
    });

    return postAllTrainData(cloneData).then((res) => {
      if (res.status !== 'success') {
        return Toast.fire({
          icon: 'error',
          title: '新增資料異常',
          text: res.message,
        });
      }
      // 導回故事瀏覽頁面
      Toast.fire({
        icon: 'success',
        title: '新增故事成功',
      });
      onSetAllTrainData(res.data);
      setCreate(false);
      setNewStory({});
      setDefaultValue(newStory.story);
      return onSetStory(newStory.story);
    });
  }, [onSetStory, onSetAllTrainData, cloneData, newStory]);

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
          <ShowStory story={story} onDeleteStory={atDeleteStory} />
        )}
        {create && (
          <CreateStory
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
