/* eslint-disable no-shadow */
import * as React from 'react';
import useSWR from 'swr';
import { fetchAllData, postAllTrainData } from 'services/api';
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
  const {
    story,
    stories,
    nlu,
    cloneData,
    deletedStory,
    onSetStory,
    onSetDeleteStory,
    onSetAllTrainData,
  } = useStoryStore((state: State) => {
    return {
      story: state.story,
      stories: state.stories,
      nlu: state.nlu,
      domain: state.domain,
      cloneData: state.cloneData,
      deletedStory: state.deletedStory,
      onSetStory: state.onSetStory,
      onSetDeleteStory: state.onSetDeleteStory,
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
      // 詢問確認刪除
      confirmWidget(storyName, 'delete').then((result) => {
        if (!result.isConfirmed) return;

        // 將刪除的故事取出來
        const deleteStory = cloneData.stories.filter(
          (item) => item.story === storyName,
        )[0];

        // 篩選出不是要刪除的故事
        const deleteIdx = cloneData.stories.indexOf(deleteStory);
        cloneData.stories.splice(deleteIdx, 1);

        const intentArr = [];
        const actionArr = [];

        // 將要刪除故事的使用者例句和機器人回覆組回去，並將要刪除故事的action和意圖取出
        deleteStory.steps.map((step) => {
          if (step.action) {
            step.response = cloneData.domain.responses[
              step.action
            ][0].text.replace(/ {2}\\n/g, '\\r');
            actionArr.push(step.action);
          }

          if (step.intent) {
            const examples = cloneData.nlu.rasa_nlu_data.common_examples.filter(
              (nluItem) =>
                nluItem.intent === step.intent && nluItem.text !== step.intent,
            );
            const currentExamples = examples.map((example) => example.text);
            step.examples = currentExamples;
            intentArr.push(step.intent);
          }
          return step;
        });

        // 刪除nlu訓練檔中的例句
        intentArr.map((intent) => {
          for (
            let i = 0;
            i < cloneData.nlu.rasa_nlu_data.common_examples.length;
            i += 1
          ) {
            if (
              cloneData.nlu.rasa_nlu_data.common_examples[i].intent === intent
            ) {
              cloneData.nlu.rasa_nlu_data.common_examples.splice(i, 1);
              i -= 1;
            }
          }
          for (let i = 0; i < cloneData.domain.intents.length; i += 1) {
            if (cloneData.domain.intents[i] === intent) {
              cloneData.domain.intents.splice(i, 1);
              i -= 1;
            }
          }
          return intent;
        });

        // 刪除domain訓練檔中的actions和機器人回覆
        actionArr.map((deleteAction) => {
          return cloneData.domain.actions.map((domainAction, idx) => {
            if (domainAction === deleteAction) {
              cloneData.domain.actions.splice(idx, 1);
            }
            return delete cloneData.domain.responses[deleteAction];
          });
        });

        // 發送API更新資料庫資料
        postAllTrainData(cloneData).then((res) => {
          if (res.status !== 'success') {
            return Toast.fire({
              icon: 'error',
              title: '刪除故事流程失敗',
              text: res.message,
            });
          }

          Toast.fire({
            icon: 'success',
            title: '刪除故事流程成功',
          });
          onSetAllTrainData(res.data);
          setDefaultValue('');
          onSetStory('');
          return onSetDeleteStory(deleteStory);
        });
      });
    },
    [onSetAllTrainData, onSetStory, onSetDeleteStory, cloneData],
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
    (createStory: StoryType) => {
      // 資料更新
      const userStep = [];
      const botStep = [];
      // 驗證步驟是否正確
      createStory.steps.map((step) =>
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
      const currentExamples = createStory.steps
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
      const currentAction = createStory.steps
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
      const cloneNewStory = cloneDeep(createStory);

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
            title: '新增故事失敗',
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
        setDefaultValue(createStory.story);
        return onSetStory(createStory.story);
      });
    },
    [onSetStory, onSetAllTrainData, cloneData],
  );

  // 恢復刪除故事(只能恢復最後一筆資料)
  const atRecoverDeletedStory = React.useCallback(
    (deleteStory: StoryType) => {
      atClickSaveBtn(deleteStory);
      onSetDeleteStory({});
    },
    [onSetDeleteStory, atClickSaveBtn],
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
              {Object.keys(deletedStory).length > 0 && (
                <div className={cx('btn', style.navbar)}>
                  <MyButton
                    variant="primary"
                    onClick={() => atRecoverDeletedStory(deletedStory)}
                  >
                    恢復刪除
                  </MyButton>
                </div>
              )}
            </div>
          </div>
        </div>
        <div id="data-panel" />
        {Object.keys(story).length > 0 && (
          <ShowStory
            story={story}
            onDeleteStory={atDeleteStory}
            onRecoverDeletedStory={atClickSaveBtn}
          />
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
