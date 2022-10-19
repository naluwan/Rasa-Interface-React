import * as React from 'react';
import useSWR from 'swr';
import { fetchAllData, postAllTrainData, fetchAllAction } from 'services/api';
import shallow from 'zustand/shallow';
// eslint-disable-next-line no-unused-vars
import type { State, StoryType } from 'components/types';
import ShowStory from 'components/ShowStory';
import cx from 'classnames';
import { Toast, confirmWidget, swalInput } from 'utils/swalInput';
import MyButton from 'components/MyButton';
import CreateStory from 'components/CreateStory';
import { cloneDeep } from 'lodash-es';
import { randomBotResAction } from 'utils/randomBotResAction';
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
    actions,
    storiesOptions,
    onSetStory,
    onSetDeleteStory,
    onSetAllTrainData,
    onSetAllAction,
  } = useStoryStore((state: State) => {
    return {
      story: state.story,
      stories: state.stories,
      nlu: state.nlu,
      domain: state.domain,
      cloneData: state.cloneData,
      deletedStory: state.deletedStory,
      actions: state.actions,
      storiesOptions: state.storiesOptions,
      onSetStory: state.onSetStory,
      onSetDeleteStory: state.onSetDeleteStory,
      onSetAllTrainData: state.onSetAllTrainData,
      onSetAllAction: state.onSetAllAction,
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
        story.steps.map((step) => {
          if (step.action) {
            actionArr.push(step.action);
            /*
            刪除按鈕資訊
            1.刪除domain訓練檔中按鈕回覆的action和意圖
            2.刪除nlu訓練檔中按鈕回覆的例句
            3.刪除stories訓練檔中按鈕的story
            */
            if (step.buttons) {
              step.buttons.map((button) => {
                // 如果是自建的選項才需要此步驟，如果是選項是回覆現有故事流程中的故事就不用
                if (!button.disabled) {
                  actionArr.push(button.buttonAction);
                  intentArr.push(button.payload);
                }
                const allStoryName = cloneData.stories.map(
                  (item) => item.story,
                );
                const buttonStoryIdx = allStoryName.indexOf(
                  `button_${button.title}`,
                );
                if (buttonStoryIdx !== -1) {
                  cloneData.stories.splice(buttonStoryIdx, 1);
                }
                return button;
              });
            }
          }

          if (step.intent) {
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
          onSetDeleteStory(story);
          return onSetStory('');
        });
      });
    },
    [onSetAllTrainData, onSetStory, onSetDeleteStory, cloneData, story],
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
            fetchAllAction().then((actionData) => onSetAllAction(actionData));
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
        fetchAllAction().then((actionData) => onSetAllAction(actionData));
        setNewStory({ story: createStoryName, steps: [] });
        onSetStory('');
        setCreate(true);
        setDefaultValue('');
      },
    );
  }, [newStory, onSetStory, stories, onSetAllAction]);

  // 新增故事點擊儲存按鈕
  const atClickSaveBtn = React.useCallback(
    (createStory: StoryType) => {
      // 資料更新
      const userStep = [];
      const botStep = [];
      // 驗證步驟是否正確
      createStory.steps.map((step, idx) =>
        step.intent
          ? userStep.push({ step, idx })
          : botStep.push({ step, idx }),
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

      // 驗證故事流程順序
      let curIdx = 0;
      const isRightProcess = userStep.every((step) => {
        if (step.idx !== curIdx) {
          return false;
        }
        curIdx += 2;
        return true;
      });
      if (!isRightProcess) {
        return Toast.fire({
          icon: 'error',
          title: '無法同時有兩個使用者對話，請重新嘗試',
        });
      }

      // 在完成儲存動作之前還需要newStory，所以需要深層複製，否則後面某些物件資料後，會有問題
      const cloneNewStory = cloneDeep(createStory);

      // 組成故事流程的訓練檔格式
      cloneNewStory.steps = cloneNewStory.steps.map((step) => {
        if (step.intent) {
          delete step.examples;
        }
        if (step.action) {
          delete step.response;
          delete step.buttons;
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
        .map((step) => {
          const buttons = [];
          if (step.buttons) {
            step.buttons.map((button) =>
              buttons.push({
                title: button.title,
                payload: button.payload,
                reply: button.reply,
              }),
            );
          }
          return {
            action: step.action,
            text: step.response,
            buttons,
          };
        });

      // 需要操作currentAction，所以必須要深拷貝一份
      const cloneAction = cloneDeep(currentAction);

      // 將機器人回覆放進domain訓練檔中
      cloneAction.map((actionItem) => {
        // 放進按鈕回覆
        if (actionItem.buttons.length) {
          actionItem.buttons.map((button) => delete button.reply);
          cloneData.domain.responses[actionItem.action] = [
            { text: actionItem.text, buttons: actionItem.buttons },
          ];
        } else {
          cloneData.domain.responses[actionItem.action] = [
            { text: actionItem.text },
          ];
        }
        return cloneData.domain.actions.push(actionItem.action);
      });

      // 將按鈕意圖加入nlu訓練檔中
      currentAction.map((actionItem) => {
        if (actionItem.buttons.length) {
          actionItem.buttons.map((button) => {
            const intent = button.payload.replace(/\//g, '');

            // 按鈕只需要新增沒有相同意圖的就好，因為同意圖，代表是要回答現有的故事流程回答
            if (
              cloneData.nlu.rasa_nlu_data.common_examples.every(
                (nluItem) => nluItem.intent !== intent,
              )
            ) {
              const reply = JSON.parse(
                JSON.stringify(button.reply).replace(/ \\n/g, '\\r'),
              );
              cloneData.nlu.rasa_nlu_data.common_examples.push({
                text: button.title,
                intent,
                entities: [],
              });
              const actionName = randomBotResAction(actions);
              cloneData.stories.push({
                story: `button_${intent}`,
                steps: [
                  { user: button.title, intent, entities: [] },
                  { action: actionName },
                ],
              });
              cloneData.domain.actions.push(actionName);
              cloneData.domain.responses[actionName] = [{ text: reply }];
              cloneData.domain.intents.push(button.payload);
            }
            return button;
          });
        }
        return actionItem;
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
    [onSetStory, onSetAllTrainData, cloneData, actions],
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
                {storiesOptions &&
                  storiesOptions.map((item) => (
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
            isCreate={create}
            newStory={newStory}
            nlu={nlu.rasa_nlu_data.common_examples}
            actions={actions}
            onSetNewStory={setNewStory}
            onClickSaveBtn={atClickSaveBtn}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(Stories);
