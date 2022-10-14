import * as React from 'react';
// import useSWR from 'swr';
import {
  fetchAllData,
  putExamples,
  putUserSay,
  putBotResponse,
  deleteStory,
  postStory,
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
   * @type {[string, Function]}
   */
  // const [newStoryName, setNewStoryName] = React.useState('');
  /**
   * @type {[StoryType, Function]}
   */
  const [newStory, setNewStory] = React.useState({});
  const { story, stories, nlu, domain, onSetStory, onSetAllTrainData } =
    useStoryStore((state: State) => {
      return {
        story: state.story,
        stories: state.stories,
        nlu: state.nlu,
        domain: state.domain,
        onSetStory: state.onSetStory,
        onSetAllTrainData: state.onSetAllTrainData,
      };
    }, shallow);

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

  // 新增故事點擊儲存按鈕
  const atClickSaveBtn = React.useCallback(() => {
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
        return nlu.rasa_nlu_data.common_examples.push({
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
      domain.responses[actionItem.action] = [{ text: actionItem.text }];
      return domain.actions.push(actionItem.action);
    });

    // 在完成儲存動作之前還需要newStory，所以需要深層複製，否則後面某些物件資料後，會有問題
    const currentStory = JSON.parse(JSON.stringify(newStory));

    // 組成故事流程的訓練檔格式
    currentStory.steps = currentStory.steps.map((step) => {
      if (step.intent) {
        delete step.examples;
      }
      if (step.action) {
        delete step.response;
      }
      return step;
    });

    // 將新增的故事放進stories訓練檔中
    stories.push(currentStory);

    currentStory.steps.map((step) => {
      if (step.intent) {
        nlu.rasa_nlu_data.common_examples.push({
          text: step.user,
          intent: step.intent,
          entities: [],
        });
        domain.intents.push(step.intent);
      }
      return step;
    });

    // TODO:API接收後做接下來的回應
    postStory({ stories, nlu, domain }).then((data) => {
      console.log('stories post:', data);
    });

    // 導回故事瀏覽頁面
    setCreate(false);
    setNewStory({});
    setDefaultValue(currentStory.story);
    return onSetStory(currentStory.story);
  }, [newStory, nlu, domain, stories, onSetStory]);

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
            steps={newStory.steps}
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
