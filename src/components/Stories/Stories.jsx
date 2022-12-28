import * as React from 'react';
import useSWR from 'swr';
import {
  fetchAllData,
  postAllTrainData,
  fetchAllAction,
  fetchAllCategories,
  postCategory,
} from 'services/api';
import shallow from 'zustand/shallow';
import type { State, StoryType, CreateStoryState } from 'components/types';
import ShowStory from 'components/ShowStory';
import cx from 'classnames';
import { Toast, confirmWidget } from 'utils/swalInput';
import MyButton from 'components/MyButton';
import CreateStory from 'components/CreateStory';
import { cloneDeep } from 'lodash-es';
import { randomBotResAction } from 'utils/randomBotResAction';
import style from './Stories.module.scss';
import useStoryStore from '../../store/useStoryStore';
import useCreateStoryStore from '../../store/useCreateStoryStore';
import Slots from './Slots';

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
  const [newStoryInfo, setNewStoryInfo] = React.useState({
    story: '',
    steps: [],
    metadata: { category: '', create: false },
  });

  /**
   * @type {[{key:string,slotInfo:{type:string,values?:string[]}}[], Function]}
   */
  const [slots, setSlots] = React.useState([]);

  const {
    story,
    stories,
    nlu,
    domain,
    cloneData,
    deletedStory,
    actions,
    storiesOptions,
    onSetStory,
    onSetDeleteStory,
    onSetAllTrainData,
    onSetAllAction,
    onSetRasaTrainState,
    onSetAllCategories,
    categories,
    onSetSelectedCategory,
    selectedCategory,
    onSetSelectedStory,
    selectedStory,
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
      onSetRasaTrainState: state.onSetRasaTrainState,
      onSetAllCategories: state.onSetAllCategories,
      categories: state.categories,
      onSetSelectedCategory: state.onSetSelectedCategory,
      selectedCategory: state.selectedCategory,
      onSetSelectedStory: state.onSetSelectedStory,
      selectedStory: state.selectedStory,
    };
  }, shallow);

  const {
    newStory,
    onSetSelectedBranchStory,
    onCreateNewStory,
    onInitialNewStory,
    onSetSelectedConnectBranchStory,
  } = useCreateStoryStore((state: CreateStoryState) => {
    return {
      newStory: state.newStory,
      onInitialNewStory: state.onInitialNewStory,
      onCreateNewStory: state.onCreateNewStory,
      onSetSelectedBranchStory: state.onSetSelectedBranchStory,
      onSetSelectedConnectBranchStory: state.onSetSelectedConnectBranchStory,
    };
  }, shallow);

  // 進入頁面打API要所有訓練資料
  const { data } = useSWR('/api/getAllTrainData', fetchAllData);
  const allCategories = useSWR('/api/getAllCategories', fetchAllCategories);

  // 進入頁面獲取設定資料
  React.useEffect(() => {
    onSetAllTrainData(data);
  }, [data, onSetAllTrainData]);

  // 進入頁面設定故事類別
  React.useEffect(() => {
    onSetAllCategories(allCategories.data);
  }, [allCategories.data, onSetAllCategories]);

  // 只要資料有更新，就更新全部機器人回覆action name
  React.useEffect(() => {
    fetchAllAction().then((actionData) => onSetAllAction(actionData));
    fetch(`http://192.168.10.105:5005/status`)
      .then((res) => res.json())
      .then((stateData) =>
        onSetRasaTrainState(stateData.num_active_training_jobs),
      );
  }, [cloneData, onSetAllAction, onSetRasaTrainState]);

  // 離開頁面將顯示故事刪除
  React.useEffect(() => {
    // 離開頁面將story設為空
    return () => {
      onSetStory('');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 待domain資料設定完成後，設定slots值
  React.useEffect(() => {
    if (Object.keys(domain).length && Object.keys(domain.slots).length) {
      const allSlots = Object.entries(domain.slots);
      const filteredSlots = allSlots.map((slot) => ({
        key: slot[0],
        slotInfo: slot[1],
      }));
      setSlots(filteredSlots);
    }
  }, [domain]);

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

        const intentArr = [];
        const actionArr = [];
        const entitiesArr = [];
        let branchStories = [];
        const deleteStoriesArr = [];

        // 將要刪除的故事放入待刪除故事陣列中
        deleteStoriesArr.push(deleteStory.story);

        // 獲取所有故事名稱
        const allStoryName = cloneData.stories.map((item) => item.story);

        // console.log(story);
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

                deleteStoriesArr.push(`button_${story.story}_${button.title}`);
                return button;
              });
            }
          }

          if (step.intent) {
            intentArr.push(step.intent);
            // 將關鍵字組回原始資訊並將entity放進entitiesArr裡，後面繼續做處理
            step.entities = step.entities.map((entityItem) => {
              entitiesArr.push({ entity: Object.keys(entityItem)[0] });
              return {
                start: step.user.indexOf(Object.values(entityItem)[0]),
                end:
                  step.user.indexOf(Object.values(entityItem)[0]) +
                  Object.values(entityItem)[0].length,
                value: Object.values(entityItem)[0],
                entity: Object.keys(entityItem)[0],
              };
            });
          }

          // 將支線故事放進branchStories中，後面處理
          if (step.checkpoint) {
            branchStories = step.branchStories;
          }
          return step;
        });

        // 刪除支線故事的故事流程、支線故事機器人回覆和回覆名稱
        branchStories.map((branchStory) => {
          // 將要刪除的故事名稱放進待刪除故事陣列中，後面一併處理
          deleteStoriesArr.push(branchStory.story);

          // 找到該支線故事的回覆
          branchStory.steps.map((branchStep, idx) => {
            if (branchStep.action) {
              actionArr.push(branchStep.action);
              if (branchStep.buttons) {
                branchStep.buttons.map((button) => {
                  // 如果是自建的選項才需要此步驟，如果是選項是回覆現有故事流程中的故事就不用
                  if (!button.disabled) {
                    actionArr.push(button.buttonAction);
                    intentArr.push(button.payload);
                  }
                  // 將要刪除的故事名稱放進待刪除故事陣列中，後面一併處理
                  deleteStoriesArr.push(
                    `button_${branchStory.story}_${button.title}`,
                  );
                  return button;
                });
              }
            }
            if (
              idx !== 0 &&
              branchStep.checkpoint &&
              branchStep.branchStories.length
            ) {
              // 刪除支線故事內串接的支線故事
              branchStep.branchStories.map((connectStory) => {
                // 將要刪除的故事名稱放進待刪除故事陣列中，後面一併處理
                deleteStoriesArr.push(connectStory.story);
                return connectStory.steps.map((connectStep) => {
                  if (connectStep.action) {
                    actionArr.push(connectStep.action);
                    if (connectStep.buttons) {
                      connectStep.buttons.map((button) => {
                        // 如果是自建的選項才需要此步驟，如果是選項是回覆現有故事流程中的故事就不用
                        if (!button.disabled) {
                          actionArr.push(button.buttonAction);
                          intentArr.push(button.payload);
                        }
                        // 將要刪除的故事名稱放進待刪除故事陣列中，後面一併處理
                        deleteStoriesArr.push(
                          `button_${
                            branchStory.story
                          }_${connectStory.story.slice(
                            connectStory.story.lastIndexOf('_') + 1,
                            connectStory.story.length,
                          )}_${button.title}`,
                        );
                        return button;
                      });
                    }
                  }
                  return connectStep;
                });
              });
            }
            return branchStep;
          });
          return branchStory;
        });

        // 刪除故事
        deleteStoriesArr.map((deleteStoryItem) => {
          const deleteStoryItemIdx = allStoryName.indexOf(deleteStoryItem);
          if (deleteStoryItemIdx > -1) {
            allStoryName.splice(deleteStoryItemIdx, 1);
            cloneData.stories.splice(deleteStoryItemIdx, 1);
          }
          return deleteStoryItem;
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
            // console.log('delete story domainAction ===>', domainAction);
            // console.log('delete story deleteAction ===>', deleteAction);
            // console.log(
            //   'domainAction === deleteAction ===>',
            //   domainAction === deleteAction,
            // );
            if (domainAction === deleteAction) {
              cloneData.domain.actions.splice(idx, 1);
            }
            return delete cloneData.domain.responses[deleteAction];
          });
        });

        // 驗證stories訓練檔中是否有其他故事有用到此關鍵字
        entitiesArr.map((deleteEntity) => {
          deleteEntity.isExist = cloneData.stories.some((item) => {
            return item.steps.some((step) => {
              if (step.intent && step.entities.length) {
                return Object.keys(step.entities).some(
                  (entityItem) => entityItem === deleteEntity.entity,
                );
              }
              return false;
            });
          });
          return deleteEntity;
        });

        // 驗證nlu訓練檔中是否有其他例句有此關鍵字
        entitiesArr.map((deleteEntity) => {
          deleteEntity.isExist =
            cloneData.nlu.rasa_nlu_data.common_examples.some((nluItem) => {
              if (nluItem.entities.length) {
                return nluItem.entities.some(
                  (entityItem) => entityItem.entity === deleteEntity.entity,
                );
              }
              return false;
            });
          return deleteEntity;
        });

        // 如果關鍵字都不存在，就刪除domain訓練檔中的entities資料
        entitiesArr.map((entityItem) => {
          if (!entityItem.isExist) {
            cloneData.domain.entities.splice(
              cloneData.domain.entities.indexOf(entityItem.entity),
              1,
            );
          }
          return entityItem;
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
          onSetSelectedBranchStory({
            story: '',
            steps: [],
          });
          onSetSelectedConnectBranchStory({
            story: '',
            steps: [],
          });
          setCreate(false);
          setDefaultValue(storyName);
          onSetSelectedCategory(story.metadata?.category);
          onSetSelectedStory(storyName);
          onSetStory(storyName);
          onInitialNewStory();
        });
      }
      onSetSelectedBranchStory({
        story: '',
        steps: [],
      });
      onSetSelectedConnectBranchStory({
        story: '',
        steps: [],
      });

      setCreate(false);
      setDefaultValue(storyName);
      onSetSelectedCategory(story.metadata?.category);
      onSetSelectedStory(storyName);
      onSetStory(storyName);
      return onInitialNewStory();
    },
    [
      onSetStory,
      newStory,
      onInitialNewStory,
      onSetSelectedBranchStory,
      onSetSelectedConnectBranchStory,
      onSetSelectedCategory,
      story.metadata?.category,
      onSetSelectedStory,
    ],
  );

  // 側邊攔收藏
  // const saveMenu = React.useCallback((categoryName: string) => {
  //   setSelectedCategory(categoryName);
  // const senderId = document.querySelectorAll('#senderId > div > ul');
  // senderId.forEach((key) => {
  //   key.setAttribute('data-open', 'noopen');
  // });
  // target.setAttribute('data-open', 'open');
  // }, []);

  // 新增故事
  /* const atClickCreateStoryBtn = React.useCallback(() => {
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
          onSetSelectedBranchStory({
            story: '',
            steps: [],
          });
          onSetSelectedConnectBranchStory({
            story: '',
            steps: [],
          });
          onCreateNewStory(createStoryName);
          onSetStory('');
          setCreate(true);
          // setDefaultValue('');
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
        onSetSelectedBranchStory({
          story: '',
          steps: [],
        });
        onSetSelectedConnectBranchStory({
          story: '',
          steps: [],
        });
        onCreateNewStory(createStoryName);
        onSetStory('');
        setCreate(true);
        // setDefaultValue('');
      },
    );
  }, [
    newStory,
    onSetStory,
    stories,
    onCreateNewStory,
    onSetSelectedBranchStory,
    onSetSelectedConnectBranchStory,
  ]);
  */

  // 新增故事點擊儲存按鈕
  const atClickSaveBtn = React.useCallback(
    (createStory: StoryType, isRecoverDeletedStory: boolean) => {
      const newStories = cloneDeep(cloneData.stories);
      const newNlu = cloneDeep(cloneData.nlu);
      const newDomain = cloneDeep(cloneData.domain);

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
          title: '故事流程步驟順序有問題，請重新嘗試',
        });
      }

      // 在完成儲存動作之前還需要newStory，所以需要深層複製，否則後面某些物件資料後，會有問題
      const cloneNewStory = cloneDeep(createStory);

      // 組成故事流程的訓練檔格式
      cloneNewStory.steps = cloneNewStory.steps.map((step) => {
        if (step.intent) {
          // console.log('step entities:', step.entities);
          delete step.examples;
          step.intent = step.intent.trim();
          step.user = step.user.trim();
          step.entities = step.entities.map((entityItem) => ({
            [entityItem.entity]: entityItem.value,
          }));
        }
        if (step.action) {
          delete step.response;
          delete step.buttons;
        }
        if (step.checkpoint) {
          delete step.branchStories;
        }
        return step;
      });

      newStories.push(cloneNewStory);

      let branchStories = [];
      const currentAction = [];

      const cloneBranchStories = cloneDeep(createStory);
      cloneBranchStories.steps.map((step) => {
        if (step.checkpoint) {
          branchStories = step.branchStories;
        }
        return step;
      });

      // 支線故事和支線故事內的串接故事處理
      if (branchStories.length) {
        // 支線故事
        branchStories.map((branchStory) => {
          branchStory.steps.map((step, idx) => {
            // 支線故事action和buttons處理
            if (step.action) {
              const buttons = [];
              if (step.buttons) {
                step.buttons.map((button) => {
                  const isPayload = button.payload.indexOf('/');
                  if (isRecoverDeletedStory) {
                    return buttons.push({
                      title: button.title,
                      payload:
                        isPayload > -1 ? button.payload : `/${button.payload}`,
                      reply: button.reply,
                    });
                  }
                  return buttons.push({
                    title: button.title,
                    payload:
                      isPayload > -1
                        ? `/${branchStory.story}_${button.payload.slice(
                            1,
                            button.payload.length,
                          )}`
                        : `/${branchStory.story}_${button.payload}`,
                    reply: button.reply,
                  });
                });
              }
              currentAction.push({
                action: step.action,
                text: step.response,
                buttons,
              });
              // 上方action和buttons處離完後，需要刪除不能在訓練檔出現的資料
              delete step.response;
              delete step.buttons;
            }
            if (idx !== 0 && step.checkpoint) {
              // 支線故事內的串接故事
              step.branchStories.map((connectBranchStory) => {
                connectBranchStory.steps.map((connectStep) => {
                  // 串接故事的action和buttons處理
                  if (connectStep.action) {
                    const buttons = [];
                    if (connectStep.buttons) {
                      connectStep.buttons.map((button) => {
                        const isPayload = button.payload.indexOf('/');
                        if (isRecoverDeletedStory) {
                          return buttons.push({
                            title: button.title,
                            payload:
                              isPayload > -1
                                ? button.payload
                                : `/${button.payload}`,
                            reply: button.reply,
                          });
                        }
                        return buttons.push({
                          title: button.title,
                          payload:
                            isPayload > -1
                              ? `/${
                                  branchStory.story
                                }_${connectBranchStory.story.slice(
                                  connectBranchStory.story.lastIndexOf('_') + 1,
                                  connectBranchStory.story.length,
                                )}_${button.payload.slice(
                                  1,
                                  button.payload.length,
                                )}`
                              : `/${
                                  branchStory.story
                                }_${connectBranchStory.story.slice(
                                  connectBranchStory.story.lastIndexOf('_') + 1,
                                  connectBranchStory.story.length,
                                )}_${button.payload}`,
                          reply: button.reply,
                        });
                      });
                    }
                    currentAction.push({
                      action: connectStep.action,
                      text: connectStep.response,
                      buttons,
                    });
                    // 上方action和buttons處離完後，需要刪除不能在訓練檔出現的資料
                    delete connectStep.response;
                    delete connectStep.buttons;
                  }
                  return connectStep;
                });
                // 將串接故事新增進stories訓練檔中
                return newStories.push(connectBranchStory);
              });
            }
            // 支線故事和串接故事處理完後，一樣需要刪除
            delete step.branchStories;
            return step;
          });
          // 將支線故事新增進stories訓練檔中
          return newStories.push(branchStory);
        });
      }

      // 將使用者對話加入nlu和domain訓練檔中
      cloneNewStory.steps.map((step) => {
        if (step.intent) {
          newNlu.rasa_nlu_data.common_examples.push({
            text: step.user,
            intent: step.intent,
            entities: createStory.steps.filter(
              (createStoryStep) => createStoryStep.intent === step.intent,
            )[0].entities,
          });
          newDomain.intents.push(step.intent);
        }
        return step;
      });

      cloneNewStory.steps.map((step) => {
        if (step.intent) {
          const { entities } = createStory.steps.filter(
            (createStoryStep) => createStoryStep.intent === step.intent,
          )[0];
          // console.log('entities:', entities);
          entities.map(
            (entityItem) =>
              !newDomain.entities.includes(entityItem.entity) &&
              newDomain.entities.push(entityItem.entity),
          );
        }
        return step;
      });

      // 組成例句的訓練檔格式
      const currentExamples = createStory.steps
        .filter((step) => step.examples)
        .map((step) => step.examples);

      // 將例句訓練檔放進nlu訓練檔中
      currentExamples.map((exampleItem) => {
        return exampleItem.map((example) => {
          return newNlu.rasa_nlu_data.common_examples.push({
            text: example.text,
            intent: example.intent,
            entities: example.entities,
          });
        });
      });

      // 組成機器人回覆的訓練檔格式
      createStory.steps
        .filter((step) => step.action)
        .map((step) => {
          const buttons = [];
          if (step.buttons) {
            step.buttons.map((button) => {
              const isPayload = button.payload.indexOf('/');
              if (isRecoverDeletedStory) {
                return buttons.push({
                  title: button.title,
                  payload:
                    isPayload > -1 ? button.payload : `/${button.payload}`,
                  reply: button.reply,
                });
              }
              return buttons.push({
                title: button.title,
                payload:
                  isPayload > -1
                    ? `/${createStory.story}_${button.payload.slice(
                        1,
                        button.payload.length,
                      )}`
                    : `/${createStory.story}_${button.payload}`,
                reply: button.reply,
              });
            });
            currentAction.push({
              action: step.action,
              text: step.response,
              buttons,
            });
          } else {
            currentAction.push({
              action: step.action,
              text: step.response,
            });
          }
          return step;
        });

      // 需要操作currentAction，所以必須要深拷貝一份
      const cloneAction = cloneDeep(currentAction);

      // 將機器人回覆放進domain訓練檔中
      cloneAction.map((actionItem) => {
        const responseText = JSON.parse(
          JSON.stringify(actionItem.text).replace(/\\n/g, '  \\n'),
        );
        // 放進按鈕回覆
        if (actionItem.buttons?.length) {
          actionItem.buttons.map((button) => delete button.reply);
          newDomain.responses[actionItem.action] = [
            { text: responseText, buttons: actionItem.buttons },
          ];
        } else {
          newDomain.responses[actionItem.action] = [{ text: responseText }];
        }
        return newDomain.actions.push(actionItem.action);
      });

      // 將按鈕意圖加入nlu訓練檔中
      currentAction.map((actionItem) => {
        if (actionItem.buttons?.length) {
          actionItem.buttons.map((button) => {
            const intent = button.payload.replace(/\//g, '');

            // 按鈕只需要新增沒有相同意圖的就好，因為同意圖，代表是要回答現有的故事流程回答
            if (
              newNlu.rasa_nlu_data.common_examples.every(
                (nluItem) => nluItem.intent !== intent,
              )
            ) {
              const reply = JSON.parse(
                JSON.stringify(button.reply).replace(/\\n/g, '  \\n'),
              );
              newNlu.rasa_nlu_data.common_examples.push({
                text: button.title,
                intent,
                entities: [],
              });
              const actionName = randomBotResAction(actions);
              newStories.push({
                story: `button_${intent}`,
                steps: [
                  { user: button.title, intent, entities: [] },
                  { action: actionName },
                ],
              });
              newDomain.actions.push(actionName);
              newDomain.responses[actionName] = [{ text: reply }];
              newDomain.intents.push(intent);
            }
            return button;
          });
        }
        return actionItem;
      });

      const isNewCategory = categories.every(
        (category) => category.name !== createStory.metadata.category,
      );

      // 判斷是否為新類別，如果是就新增類別
      if (isNewCategory) {
        postCategory(createStory.metadata.category).then((updateCategories) => {
          console.log('update categories ===> ', updateCategories);
          onSetAllCategories(updateCategories);
        });
      }

      const newData = {
        stories: newStories,
        nlu: newNlu,
        domain: newDomain,
      };

      return postAllTrainData(newData).then((res) => {
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
        onSetSelectedBranchStory({
          story: '',
          steps: [],
        });
        onSetSelectedConnectBranchStory({
          story: '',
          steps: [],
        });
        onSetAllTrainData(res.data);
        setCreate(false);
        onInitialNewStory();
        // setDefaultValue(createStory.story);
        return onSetStory(createStory.story);
      });
    },
    [
      onSetStory,
      onSetAllTrainData,
      cloneData,
      actions,
      categories,
      onInitialNewStory,
      onSetSelectedBranchStory,
      onSetSelectedConnectBranchStory,
      onSetAllCategories,
    ],
  );

  // 恢復刪除故事(只能恢復最後一筆資料)
  const atRecoverDeletedStory = React.useCallback(
    (deleteStory: StoryType) => {
      const isExist = stories.some((item) => item.story === deleteStory.story);
      if (isExist) {
        Toast.fire({
          icon: 'warning',
          title: '故事名稱重複',
        });
        return;
      }
      atClickSaveBtn(deleteStory, true);
      onSetDeleteStory({});
    },
    [onSetDeleteStory, atClickSaveBtn, stories],
  );

  // 更新新故事資訊
  const atChangeNewStoryInfo = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      // 獲取使用者輸入的資訊
      const { name, value } = e.target;

      // 更新故事名稱
      if (name === 'story') {
        setNewStoryInfo((prev) => {
          return {
            ...prev,
            [name]: value,
          };
        });
      }

      // 使用者選擇建立新類別
      if (name === 'category' && value === 'createNewCategory') {
        setNewStoryInfo((prev) => {
          return {
            ...prev,
            metadata: {
              ...prev.metadata,
              category: '',
              create: true,
            },
          };
        });
      }

      // 使用者選擇已建好的類別
      if (name === 'category' && value !== 'createNewCategory') {
        setNewStoryInfo((prev) => {
          return {
            ...prev,
            metadata: {
              ...prev.metadata,
              [name]: value,
              create: false,
            },
          };
        });
      }

      // 輸入新類別
      if (name === 'newCategory') {
        setNewStoryInfo((prev) => {
          return {
            ...prev,
            metadata: {
              ...prev.metadata,
              category: value,
            },
          };
        });
      }
    },
    [setNewStoryInfo],
  );

  // 創建新增故事資訊
  const atCreateNewStory = React.useCallback(
    (newStoryData, storiesData, categoriesData) => {
      if (newStoryData.story === '' || newStoryData.metadata.category === '') {
        Toast.fire({
          icon: 'warning',
          title: '所有欄位都是必填的',
        });
        return;
      }

      let isRepeat = false;

      isRepeat = storiesData.some((item) => item.story === newStoryData.story);

      if (isRepeat) {
        setNewStoryInfo((prev) => {
          return {
            ...prev,
            story: '',
          };
        });
        Toast.fire({
          icon: 'warning',
          title: '故事名稱重複',
        });
        document.querySelector('.form-control#story').focus();
        return;
      }

      if (newStoryData.metadata.create) {
        isRepeat = categoriesData.some(
          (category) => category.name === newStoryData.metadata.category,
        );

        if (isRepeat) {
          setNewStoryInfo((prev) => {
            return {
              ...prev,
              metadata: {
                ...prev.metadata,
                category: '',
              },
            };
          });
          Toast.fire({
            icon: 'warning',
            title: '類別名稱重複',
          });
          document.querySelector('.form-control#newCategory').focus();
          return;
        }
      }

      delete newStoryData.metadata.create;
      onCreateNewStory(newStoryData);
      setCreate(true);
      onSetStory('');
      document.querySelector('#cancelCreateStoryBtn').click();
    },
    [setNewStoryInfo, onCreateNewStory, onSetStory],
  );

  // 提示使用者新增的故事尚未儲存
  const atClickCreateStoryBtn = React.useCallback(() => {
    if (Object.keys(newStory).length !== 0) {
      confirmWidget(newStory.story, null).then((result) => {
        if (!result.isConfirmed) {
          document.querySelector('#cancelCreateStoryBtn').click();
        }
      });
    }
  }, [newStory]);

  return (
    <>
      <div className={style.searchBar}>
        <div>
          <div id="senderId" className={style.senderId}>
            <div className={cx(style.menuBtnBlock)}>
              <h4 className={style.searchTitle}>故事流程</h4>
              <div className={cx(style.btn, style.navbar)}>
                <MyButton
                  variant="third"
                  id="createNewStoryBtn"
                  dataBsToggle="modal"
                  dataBsTarget="#createNewStoryModal"
                  onClick={() => atClickCreateStoryBtn()}
                  type="button"
                >
                  新增故事流程
                </MyButton>
              </div>
              {Object.keys(deletedStory).length > 0 && (
                <div className={cx('btn', style.recoverBtn)}>
                  <MyButton
                    variant="primary"
                    onClick={() => atRecoverDeletedStory(deletedStory)}
                  >
                    恢復刪除
                  </MyButton>
                </div>
              )}
              <div className={cx(style.btn, style.navbar)}>
                {/* <MyButton variant="secondary">記錄槽</MyButton> */}
                <button
                  className={cx('btn btn-secondary', style.recordBtn)}
                  type="button"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#showSlotsOffcanvas"
                  aria-controls="offcanvasWithBothOptions"
                >
                  記錄槽
                </button>

                {/* offcanvas 左側邊欄 */}
                <div
                  className={cx('offcanvas offcanvas-start ', style.offcanvas)}
                  data-bs-scroll="true"
                  id="showSlotsOffcanvas"
                  tabIndex="-1"
                  aria-labelledby="showSlotsOffcanvasLabel"
                >
                  <div className="offcanvas-header">
                    <h5
                      className={cx('offcanvas-title')}
                      id="showSlotsOffcanvasLabel"
                    >
                      記錄槽
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="offcanvas"
                      aria-label="Close"
                    />
                  </div>
                  <Slots slots={slots} domain={domain} />
                </div>
              </div>
            </div>
            <div className={cx(style.menuInputBlock)}>
              <select
                id="stories"
                className={cx('form-control', style.storiesSelector)}
                onChange={(e) => atSelectStory(e.target.value)}
                value={defaultValue}
              >
                <option value="" disabled hidden>
                  請選擇
                </option>
                {categories &&
                  categories.map((category) => (
                    <>
                      <option
                        className={cx(style.categoryDisabled)}
                        disabled
                        key={category.name}
                      >
                        {category.name}
                      </option>
                      {storiesOptions &&
                        storiesOptions.map((item) =>
                          item.metadata.category === category.name ? (
                            <option key={item.story} value={item.story}>
                              {item.story}
                            </option>
                          ) : null,
                        )}
                    </>
                  ))}
              </select>
              {/* <div>
                <input
                  type="text"
                  className="form-control"
                  placeholder="搜尋故事流程"
                />
              </div> */}
            </div>
            <div className={cx(style.listBlock)}>
              {categories &&
                categories.map((category) => {
                  return (
                    <ul
                      data-open={
                        selectedCategory === category.name ? 'open' : 'noopen'
                      }
                      key={category.name}
                      className={cx(style.listmenu)}
                      onClick={() => onSetSelectedCategory(category.name)}
                    >
                      {category.name}
                      <hr />
                      {storiesOptions &&
                        storiesOptions.map((item) => {
                          if (item.metadata.category === category.name) {
                            return (
                              <li key={item.story}>
                                <button
                                  className={cx(style.listBtn)}
                                  data-check={
                                    selectedStory === item.story
                                      ? 'check'
                                      : 'none'
                                  }
                                  name={item.story}
                                  value={item.story}
                                  onClick={(e) => atSelectStory(e.target.value)}
                                >
                                  {item.story}
                                </button>
                              </li>
                            );
                          }
                          return null;
                        })}
                    </ul>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
      {Object.keys(story).length > 0 && (
        <ShowStory
          isCreate={create}
          story={story}
          onDeleteStory={atDeleteStory}
        />
      )}
      {create && (
        <CreateStory
          isCreate={create}
          nlu={nlu.rasa_nlu_data.common_examples}
          actions={actions}
          onClickSaveBtn={atClickSaveBtn}
        />
      )}

      {/* add branch story modal */}
      <div
        className="modal"
        id="createNewStoryModal"
        tabIndex="-1"
        aria-labelledby="createBranchStoryModalLabel"
        aria-hidden="true"
        data-bs-backdrop="false"
      >
        <div className="modal-dialog  modal-lg modal-dialog-scrollable">
          <div className={cx('modal-content swal2-show', style.swtOut)}>
            <div>
              <h2 className="swal2-title" id="createBranchStoryModalLabel">
                建立新故事
              </h2>
              <button
                type="button"
                className={cx('swal2-close', style.swetClose)}
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() =>
                  setNewStoryInfo({
                    story: '',
                    steps: [],
                    metadata: { category: '', create: false },
                  })
                }
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="story" className="form-label">
                  故事名稱
                </label>
                <input
                  className="form-control"
                  id="story"
                  name="story"
                  placeholder="請輸入故事名稱"
                  value={newStoryInfo.story}
                  onChange={(e) => atChangeNewStoryInfo(e)}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="category" className="form-label">
                  故事類別
                </label>
                <select
                  className="form-control"
                  id="category"
                  name="category"
                  value={
                    newStoryInfo.metadata?.create
                      ? 'createNewCategory'
                      : newStoryInfo.metadata?.category
                  }
                  onChange={(e) => atChangeNewStoryInfo(e)}
                >
                  <option value="" hidden>
                    請選擇故事類別
                  </option>
                  <option value="createNewCategory">建立新類別</option>
                  {categories?.map((category) => {
                    return (
                      <option
                        key={`${category.id}-${category.name}`}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              {newStoryInfo.metadata?.create && (
                <div className="mb-3">
                  <label htmlFor="newCategory" className="form-label">
                    類別名稱
                  </label>
                  <input
                    className="form-control"
                    id="newCategory"
                    name="newCategory"
                    placeholder="請輸入類別名稱"
                    value={newStoryInfo.metadata?.category}
                    onChange={(e) => atChangeNewStoryInfo(e)}
                  />
                </div>
              )}
            </div>
            <div className="swal2-actions d-flex">
              <button
                type="button"
                className="swal2-cancel swal2-styled"
                id="cancelCreateStoryBtn"
                data-bs-dismiss="modal"
                onClick={() =>
                  setNewStoryInfo({
                    story: '',
                    steps: [],
                    metadata: { category: '', create: false },
                  })
                }
              >
                取消
              </button>
              <button
                className="swal2-confirm swal2-styled"
                onClick={() =>
                  atCreateNewStory(newStoryInfo, stories, categories)
                }
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Stories);
