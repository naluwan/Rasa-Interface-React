import * as React from 'react';
import cx from 'classnames';
import Swal from 'sweetalert2';
import shallow from 'zustand/shallow';
import uuid from 'react-uuid';
import { CgAddR } from 'react-icons/cg';
import { BsTrashFill } from 'react-icons/bs';
import style from './UserStep.module.scss';
import type {
  StepsType,
  NluEntitiesType,
  NluType,
  State,
  DomainType,
  StoryType,
} from '../types';
import { swalInput, Toast, confirmWidget } from '../../utils/swalInput';
import Entities from '../Entities';
import Examples from './Examples';
import useStoryStore from '../../store/useStoryStore';
import { randomBotResAction } from '../../utils/randomBotResAction';
import useCreateStoryStore from '../../store/useCreateStoryStore';

type UserStepProps = {
  isCreate: boolean,
  step: StepsType,
  storyName: string,
  newStory: StoryType,
  onCreateExample: (
    intent: string,
    examples: string,
    exampleEntities: NluEntitiesType[],
    storyName?: string,
  ) => void,
  onEditUserSay: (
    oriUserSay: string,
    userSay: string,
    storyName?: string,
  ) => void,
  onEditIntent: (oriIntent: String, intent: String, storyName?: string) => void,
  onCreateEntities: (
    entities: NluEntitiesType,
    intent: string,
    storyName?: string,
  ) => void,
  onRemoveUserStep: (intent: string, userSay: string) => void,
  onEditEntityShowValue: (
    stepIntent: string,
    currentEntityValue: string,
    newEntityShowValue: string,
    storyName?: string,
  ) => void,
  onEditEntity: (
    stepIntent: string,
    oriEntity: string,
    newEntity: string,
    storyName?: string,
  ) => void,
  onEditEntityValue: (
    stepIntent: string,
    oriEntityValue: string,
    newEntityValue: string,
    storyName?: string,
  ) => void,
  onDeleteEntities: (
    entityValue: string,
    intent: string,
    storyName?: string,
  ) => void,
  onDeleteExample: (
    userSay: string,
    intent: String,
    storyName?: string,
  ) => void,
  onCreateBranchStory: (newBranchStory: {
    branchName: string,
    slotValues: {
      slotName: string,
      slotValue: string,
      id: string,
      hasSlotValues: boolean,
    }[],
    botRes: { action: string, response: string },
  }) => void,
};

// 重組entities資料
const filteredEntities = (
  entities: { [key: string]: string } | NluEntitiesType,
  userSay: string,
  intent: string,
  nlu: NluType,
) => {
  const entitiesKeys = entities.map((item) => Object.keys(item));
  let currentEntities = [];
  if (
    entitiesKeys.length &&
    entitiesKeys.every((item) => item.every((keyItem) => keyItem !== 'start'))
  ) {
    // 重組entities
    [currentEntities] = nlu.rasa_nlu_data.common_examples
      .filter(
        (nluItem) => nluItem.text === userSay && nluItem.intent === intent,
      )
      .map((item) => item.entities);
    // console.log('currentEntities:', currentEntities);
  }
  // 新建故事頁面的關鍵字
  if (!currentEntities.length) {
    return entities.sort((a, b) => a.start - b.start);
  }
  // 查詢故事頁面的關鍵字
  return currentEntities.sort((a, b) => a.start - b.start); // 將entities做排序，開頭較前面的會排在上方
};

const UserStep: React.FC<UserStepProps> = (props) => {
  const {
    isCreate,
    step,
    storyName,
    newStory,
    onCreateExample,
    onEditUserSay,
    onEditIntent,
    onCreateEntities,
    onRemoveUserStep,
    onEditEntityShowValue,
    onEditEntity,
    onEditEntityValue,
    onDeleteEntities,
    onDeleteExample,
    onCreateBranchStory,
  } = props;

  const { nlu, domain, actions, stories } = useStoryStore((state: State) => {
    return {
      nlu: state.nlu,
      domain: state.domain,
      actions: state.actions,
      stories: state.stories,
    };
  }, shallow);

  const { currentStep, checkPointName, onConnectBranchStory } =
    useCreateStoryStore((state: State) => {
      return {
        currentStep: state.currentStep,
        onConnectBranchStory: state.onConnectBranchStory,
        checkPointName: state.checkPointName,
      };
    }, shallow);

  /**
   * @type {[{branchName:string, slotValues:{slotName:string,slotValue:string,id:string,hasSlotValues: boolean}[],botRes?:{action:string,response:string}}, Function]}
   */
  const [newBranchStory, setNewBranchStory] = React.useState({
    branchName: '',
    slotValues: [
      { slotName: '', slotValue: '', id: uuid(), hasSlotValues: false },
    ],
    botRes: { action: randomBotResAction(actions), response: '' },
  });

  /**
   * @type {[string, Function]}
   */
  // eslint-disable-next-line no-unused-vars
  const [resSelect, setResSelect] = React.useState('botRes');

  const showIntent =
    step.intent === 'get_started' ? '打開聊天室窗' : step.intent;

  const isGetStarted = step.intent === 'get_started';

  // 重組entities資料
  const entitiesData = React.useMemo(() => {
    return filteredEntities(step.entities, step.user, step.intent, nlu);
  }, [step.entities, step.user, step.intent, nlu]);

  // 編輯使用者對話
  const atEditUserSay = React.useCallback(
    (userSay: string) => {
      swalInput(
        '編輯使用者對話',
        'textarea',
        '請輸入使用者對話',
        userSay,
        true,
      ).then((data) => {
        if (!data || !data.new || userSay === data.new) return;
        onEditUserSay(data.ori, data.new, storyName, nlu);
      });
    },
    [onEditUserSay, storyName, nlu],
  );

  // 編輯意圖
  const atEditIntent = React.useCallback(
    (intent: string) => {
      swalInput('編輯意圖', 'textarea', '請輸入意圖', intent, true).then(
        (data) => {
          if (!data || !data.new || intent === data.new) return;
          onEditIntent(data.ori, data.new, storyName, nlu);
        },
      );
    },
    [onEditIntent, storyName, nlu],
  );

  // 新增例句
  const atCreateExample = React.useCallback(
    (
      intent: string,
      parentEntitiesData: NluEntitiesType[],
      currentStoryName: string,
    ) => {
      const exampleValue = document.querySelector(
        `#input-${intent}-example`,
      ).value;
      const entityKeys = parentEntitiesData.map(
        (entityItem) => entityItem.entity,
      );
      const entitiesValue = entityKeys.map((key) => {
        const { value } = document.querySelector(
          `#input-${key}-entities-value`,
        );
        const showValue = document.querySelector(
          `#input-${key}-entities-show-value`,
        ).value;
        return {
          start: exampleValue.indexOf(showValue),
          end: exampleValue.indexOf(showValue) + showValue.length,
          entity: key,
          value,
          showValue,
        };
      });

      // console.log('entitiesValue:', entitiesValue);
      // 所有輸入空的值都為空就返回
      if (
        exampleValue === '' &&
        entitiesValue.every((entity) => entity.value === '')
      ) {
        return;
      }

      // 輸入框有空值處理方式
      if (
        exampleValue === '' ||
        entitiesValue.some(
          (entity) => entity.value === '' || entity.showValue === '',
        )
      ) {
        Toast.fire({
          icon: 'warning',
          title: '所有欄位都是必填的',
        });
        return;
      }

      /*
          驗證關鍵字是否有效
          關鍵字必須包含在例句內
        */
      const isNotValid = [];
      entitiesValue.map((entityItem) => {
        if (!exampleValue.includes(entityItem.showValue)) {
          isNotValid.push(entityItem.entity);
        }
        return entityItem;
      });

      if (isNotValid.length) {
        isNotValid.map((notValidEntity) => {
          document.querySelector(
            `#input-${notValidEntity}-entities-show-value`,
          ).value = '';
          return notValidEntity;
        });
        Toast.fire({
          icon: 'warning',
          title: `關鍵字代表值『${isNotValid.toString()}』的關鍵字有誤，請輸入正確的關鍵字`,
        });
        return;
      }

      // 重組關鍵字資訊，關鍵字開始和結束位置
      // 驗證關鍵字是否重疊
      const repeatEntity = [];
      const isRepeat = entitiesValue.some((entityItem) => {
        return entitiesValue.some((checkEntityItem) => {
          if (entityItem.showValue !== checkEntityItem.showValue) {
            if (
              (checkEntityItem.start <= entityItem.start &&
                entityItem.start < checkEntityItem.end) ||
              (checkEntityItem.end < entityItem.end &&
                entityItem.end <= checkEntityItem.end)
            ) {
              repeatEntity.push(checkEntityItem.entity);
              return true;
            }
            return false;
          }
          return false;
        });
      });

      // 關鍵字重疊處理
      if (isRepeat) {
        repeatEntity.map((repeatKey) => {
          document.querySelector(
            `#input-${repeatKey}-entities-show-value`,
          ).value = '';
          return repeatKey;
        });
        Toast.fire({
          icon: 'warning',
          title: `代表值『${repeatEntity.toString()}』的關鍵字重疊，請重新輸入`,
        });
        return;
      }

      // 驗證關鍵字是否重複
      const isValueRepeat = entitiesValue.some((entityItem) => {
        return entitiesValue.some((checkEntityItem) => {
          if (entityItem.showValue !== checkEntityItem.showValue) {
            if (entityItem.value === checkEntityItem.value) {
              repeatEntity.push(checkEntityItem.entity);
              return true;
            }
            return false;
          }
          return false;
        });
      });

      // 關鍵字重複處理
      if (isValueRepeat) {
        repeatEntity.map((repeatKey) => {
          document.querySelector(`#input-${repeatKey}-entities-value`).value =
            '';
          return repeatKey;
        });
        Toast.fire({
          icon: 'warning',
          title: `代表值『${repeatEntity.toString()}』的記憶槽代表值重複，請重新輸入`,
        });
        return;
      }

      entitiesValue.map((entityItem) => delete entityItem.showValue);

      onCreateExample(
        intent,
        exampleValue,
        entitiesValue.sort((a, b) => a.start - b.start),
        currentStoryName,
        nlu,
      );
      document.querySelector(`#input-${intent}-example`).value = '';
      entityKeys.map((key) => {
        document.querySelector(`#input-${key}-entities-value`).value = '';
        document.querySelector(`#input-${key}-entities-show-value`).value = '';
        return key;
      });
    },
    [onCreateExample, nlu],
  );

  // 刪除例句
  const atDeleteExample = React.useCallback(
    (userSay: string, intent: string) => {
      onDeleteExample(userSay, intent, storyName);
    },
    [onDeleteExample, storyName],
  );

  // 新增關鍵字
  const atCreateEntities = React.useCallback(
    async (
      userSay: string,
      intent: string,
      currentEntities: NluEntitiesType,
      currentStoryName: string,
    ) => {
      await Swal.fire({
        title: '編輯關鍵字',
        html: `
          <input id="showValue" class="swal2-input" placeholder="請輸入關鍵字" />
          <input id="currentValue" class="swal2-input" placeholder="請輸入儲存槽代表值" />
          <input id="entity" class="swal2-input" placeholder="請輸入記錄槽名稱" />
        `,
        showCancelButton: true,
        showCloseButton: true,
        preConfirm: () => {
          return new Promise((resolve) => {
            Swal.enableButtons();
            // 獲取關鍵字(value)和關鍵字代表值(entity)
            const showValue = document.querySelector(
              '.swal2-input#showValue',
            ).value;
            const currentValue = document.querySelector(
              '.swal2-input#currentValue',
            ).value;
            const entity = document.querySelector('.swal2-input#entity').value;
            // 獲取關鍵字的起點和終點
            const start = userSay.indexOf(showValue);
            const end = userSay.indexOf(showValue) + showValue.length;
            // 驗證關鍵字代表值是否有數字
            const regex = /^[0-9]*$/g;

            // 都沒值
            if (showValue === '' && entity === '' && currentValue === '') {
              return;
            }

            // 有一個欄位沒值
            if (showValue === '' || entity === '' || currentValue === '') {
              Swal.showValidationMessage(`所有欄位都是必填的`);
              return;
            }

            // 關鍵字不在對話內
            if (!userSay.includes(showValue)) {
              Swal.showValidationMessage(`請填入正確的關鍵字`);
              document.querySelector('.swal2-input#showValue').value = '';
              return;
            }

            // 關鍵字代表值有數字
            if (regex.test(entity)) {
              Swal.showValidationMessage(`關鍵字代表值不可為純數字`);
              document.querySelector('.swal2-input#entity').value = '';
              return;
            }

            if (currentEntities.length) {
              // 驗證關鍵字是否重疊
              const isRepeat = currentEntities.some(
                (currentEntitiesItem) =>
                  (currentEntitiesItem.start <= start &&
                    start <= currentEntitiesItem.end - 1) ||
                  (currentEntitiesItem.start <= end - 1 &&
                    end - 1 <= currentEntitiesItem.end),
              );

              if (isRepeat) {
                Swal.showValidationMessage(`關鍵字不可重疊`);
                document.querySelector('.swal2-input#showValue').value = '';
                return;
              }

              // 驗證關鍵字代表值是否重複
              const isEntityRepeat = currentEntities.some(
                (currentEntitiesItem) => currentEntitiesItem.entity === entity,
              );

              if (isEntityRepeat) {
                Swal.showValidationMessage(`同一個對話內關鍵字代表值不可重複`);
                document.querySelector('.swal2-input#entity').value = '';
                return;
              }

              const isValueRepeat = currentEntities.some(
                (currentEntitiesItem) =>
                  currentEntitiesItem.value === currentValue,
              );

              if (isValueRepeat) {
                Swal.showValidationMessage(`同一個對話內記錄槽代表值不可重複`);
                document.querySelector('.swal2-input#currentValue').value = '';
                return;
              }
            }

            const entities = { start, end, entity, value: currentValue };

            resolve({ entities });
          }).catch((err) => {
            Toast.fire({
              icon: 'warning',
              title: err.message,
            });
          });
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // 新增關鍵字
          onCreateEntities(result.value.entities, intent, currentStoryName);
        }
      });
    },
    [onCreateEntities],
  );

  // 刪除關鍵字
  const atDeleteEntities = React.useCallback(
    (entity: string, entityValue: string, intent: string) => {
      confirmWidget(entityValue, 'deleteEntities').then((result) => {
        if (!result.isConfirmed) return;

        onDeleteEntities(entity, intent, storyName);
      });
    },
    [onDeleteEntities, storyName],
  );

  // 編輯關鍵字位置
  const atEditEntityShowValue = React.useCallback(
    (
      stepIntent: string,
      currentEntityValue: string,
      newEntityShowValue: string,
    ) => {
      onEditEntityShowValue(
        stepIntent,
        currentEntityValue,
        newEntityShowValue,
        storyName,
      );
    },
    [onEditEntityShowValue, storyName],
  );

  // 編輯關鍵字
  const atEditEntity = React.useCallback(
    (stepIntent: string, oriEntity: string, newEntity: string) => {
      onEditEntity(stepIntent, oriEntity, newEntity, storyName);
    },
    [onEditEntity, storyName],
  );

  // 編輯關鍵字代表值(儲存槽值)
  const atEditEntityValue = React.useCallback(
    (stepIntent: string, oriEntityValue: string, newEntityValue: string) => {
      onEditEntityValue(stepIntent, oriEntityValue, newEntityValue, storyName);
    },
    [onEditEntityValue, storyName],
  );

  // 更新支線故事資訊
  const atChangeNewBranchStory = React.useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>,
      id: string,
      domainData: DomainType,
    ) => {
      const { name, value } = e.target;

      // 更新支線故事名稱
      if (name === 'branchName') {
        return setNewBranchStory((prev) => {
          return {
            ...prev,
            [name]: value,
          };
        });
      }

      // 更新紀錄槽名稱
      if (name === 'slotName') {
        const hasSlotValues = domainData.slots[value].type === 'categorical';
        return setNewBranchStory((prev) => {
          return {
            ...prev,
            slotValues: prev.slotValues.map((item) => {
              if (item.id === id) {
                item.slotName = value;
                item.hasSlotValues = hasSlotValues;
              }
              return item;
            }),
          };
        });
      }

      // 更新儲存槽值
      if (name === 'slotValue') {
        return setNewBranchStory((prev) => {
          return {
            ...prev,
            slotValues: prev.slotValues.map((item) => {
              if (item.id === id) {
                item.slotValue = value;
              }
              return item;
            }),
          };
        });
      }

      if (name === 'resSelect') {
        setResSelect(value);
        if (value === 'branchStory') {
          return setNewBranchStory((prev) => {
            const newData = prev;
            delete newData.botRes;
            return {
              ...newData,
              resSelect: 'branchStory',
            };
          });
        }
        setResSelect('botRes');
        return setNewBranchStory((prev) => {
          const newData = prev;
          delete newData.resSelect;
          if (newData.botRes) {
            return {
              ...newData,
            };
          }
          return {
            ...newData,
            botRes: { action: randomBotResAction(actions), response: '' },
          };
        });
      }

      // 更新機器人回覆
      return setNewBranchStory((prev) => {
        return {
          ...prev,
          botRes: {
            ...prev.botRes,
            [name]: value,
          },
        };
      });
    },
    [setNewBranchStory, actions],
  );

  // 取消新增支線故事，重置新增支線故事資訊
  const atCancelCreateBranchStory = React.useCallback(
    (allAction: string[]) => {
      setNewBranchStory({
        branchName: '',
        slotValues: [{ slotName: '', slotValue: '', id: uuid() }],
        botRes: { action: randomBotResAction(allAction), response: '' },
      });
      setResSelect('botRes');
    },
    [setNewBranchStory],
  );

  // 新增slotValues 下拉選單
  const atAddSlotValue = React.useCallback(() => {
    setNewBranchStory((prev) => {
      return {
        ...prev,
        slotValues: prev.slotValues.concat([
          { slotName: '', slotValue: '', id: uuid() },
        ]),
      };
    });
  }, [setNewBranchStory]);

  // 移除slotValues 下拉選單
  const atRemoveSlotValue = React.useCallback(
    (id: string) => {
      setNewBranchStory((prev) => {
        return {
          ...prev,
          slotValues: prev.slotValues.filter((item) =>
            prev.slotValues.length > 1 ? item.id !== id : item,
          ),
        };
      });
    },
    [setNewBranchStory],
  );

  // 驗證新增支線故事所有資訊的正確性，無誤後送出新增
  const atSubmitNewBranchStory = React.useCallback(
    (
      newBranchStoryInfo: {
        branchName: string,
        slotValues: {
          slotName: string,
          slotValue: string,
          id: string,
          hasSlotValues: boolean,
        }[],
        botRes: { action: string, response: string },
      },
      storiesData: StoryType[],
      newStoryData: StoryType,
      currentCheckPointName: string,
    ) => {
      // 全部資料沒填，就關閉視窗
      if (
        newBranchStoryInfo.branchName === '' &&
        newBranchStoryInfo.slotValues.every(
          (item) => item.slotName === '' && item.slotValue === '',
        ) &&
        newBranchStoryInfo.botRes.response === ''
      ) {
        document.querySelector('#createBranchStoryModal .btn-close').click();
        return;
      }

      // 有資料未填
      /*
      slotValues判斷方式為判斷hasSlotValues是否為true，如果為true，slotValue就一定要有值，
      如果為false，代表slot為純text，那slotName一定要有值
      // */
      if (
        newBranchStoryInfo.branchName === '' ||
        newBranchStoryInfo.slotValues.some(
          (item) =>
            (item.slotName !== '' &&
              item.slotValue === '' &&
              item.hasSlotValues) ||
            (item.slotName === '' && !item.hasSlotValues),
        ) ||
        (resSelect === 'botRes' && newBranchStoryInfo.botRes.response === '')
      ) {
        Toast.fire({
          icon: 'warning',
          title: '所有欄位都是必填的',
        });
        return;
      }

      let isRepeat = false;

      isRepeat = storiesData.some(
        (item) => item.story === newBranchStoryInfo.branchName,
      );

      if (isRepeat) {
        newBranchStoryInfo.branchName = '';
        setNewBranchStory((prev) => {
          return {
            ...prev,
            branchName: '',
          };
        });
        Toast.fire({
          icon: 'warning',
          title: '支線故事名稱重複',
        });
        document.querySelector('#createBranchStoryModal #branchName').focus();
        return;
      }

      isRepeat = newStoryData.story === newBranchStoryInfo.branchName;

      if (isRepeat) {
        newBranchStoryInfo.branchName = '';
        setNewBranchStory((prev) => {
          return {
            ...prev,
            branchName: '',
          };
        });
        Toast.fire({
          icon: 'warning',
          title: '支線故事名稱重複',
        });
        document.querySelector('#createBranchStoryModal #branchName').focus();
        return;
      }

      isRepeat = newStoryData.steps.some((newStoryStep) => {
        if (newStoryStep.checkpoint && newStoryStep.branchStories.length) {
          return newStoryStep.branchStories.some((branchStory) => {
            const curBranchStoryName = branchStory.story.slice(
              branchStory.story.lastIndexOf('_') + 1,
              branchStory.story.length,
            );
            if (curBranchStoryName === newBranchStoryInfo.branchName) {
              return true;
            }
            if (branchStory.story === currentCheckPointName) {
              return branchStory.steps.some((branchStep, idx) => {
                if (idx === 2 && branchStep?.branchStories?.length) {
                  return branchStep.branchStories.some((connectStory) => {
                    const curConnectStoryName = connectStory.story.slice(
                      connectStory.story.lastIndexOf('_') + 1,
                      connectStory.story.length,
                    );
                    if (curConnectStoryName === newBranchStoryInfo.branchName) {
                      return true;
                    }
                    return false;
                  });
                }
                return false;
              });
            }
            return false;
          });
        }
        return false;
      });

      if (isRepeat) {
        newBranchStoryInfo.branchName = '';
        setNewBranchStory((prev) => {
          return {
            ...prev,
            branchName: '',
          };
        });
        Toast.fire({
          icon: 'warning',
          title: '支線故事名稱重複',
        });
        document.querySelector('#createBranchStoryModal #branchName').focus();
        return;
      }
      if (currentStep === 'main') {
        onCreateBranchStory(newBranchStoryInfo);
      }

      if (currentStep === 'branchStory') {
        onConnectBranchStory(newStoryData, newBranchStoryInfo);
      }

      setResSelect('botRes');
      document.querySelector('#createBranchStoryModal .btn-close').click();
    },
    [onCreateBranchStory, onConnectBranchStory, resSelect, currentStep],
  );

  // console.log('entitiesData:', entitiesData);
  // console.log('newBranchStory:', newBranchStory);
  // console.log('resSelect ========================>', resSelect);

  return (
    <div className="row pt-2" id="userStep">
      <div className={cx('col-sm-12 col-lg-6', style.userStepContainer)}>
        {!isGetStarted && (
          <div className={cx('py-2')}>
            <button
              type="button"
              className="btn btn-info mx-2"
              onClick={() => atEditUserSay(step.user)}
            >
              編輯
            </button>
            <button
              type="button"
              className="btn btn-outline-warning mx-2"
              onClick={() => atEditIntent(step.intent)}
            >
              意圖
            </button>
            <button
              type="button"
              className={cx('btn', 'btn-primary')}
              data-bs-toggle="modal"
              data-bs-target={`#show-${step.intent}-examples`}
            >
              例句
            </button>

            <button
              type="button"
              className={cx('btn btn-outline-info mx-2', style.keywordBtn)}
              onClick={() =>
                atCreateEntities(
                  step.user,
                  step.intent,
                  entitiesData,
                  storyName,
                )
              }
            >
              關鍵字
            </button>
            {isCreate && (
              <button
                type="button"
                className="btn btn-danger mx-2"
                onClick={() => onRemoveUserStep(step.intent, step.user)}
              >
                刪除
              </button>
            )}
          </div>
        )}

        <div className="d-flex flex-column">
          <div className="d-flex align-items-center pt-2">
            <div className={style.userTitle}>使用者:</div>
            <div className={style.userText}>
              {step.user ? step.user : showIntent}
            </div>
          </div>
          <div className="d-flex align-items-center pt-2">
            <div className={style.userTitle}>意圖:</div>
            <div className={style.userText}>{step.intent}</div>
          </div>
          {entitiesData.length > 0 && (
            <div className={style.entitiesContainer}>
              <div className={style.userTitle}>關鍵字資訊:</div>
              {entitiesData.map((entityItem) => {
                const { entity, start, end } = entityItem;
                const entityValue = entityItem.value;
                const entityShowValue = step.user.slice(start, end);
                return (
                  <Entities
                    key={entity + entityValue}
                    entity={entity}
                    entityValue={entityValue}
                    entityShowValue={entityShowValue}
                    intent={step.intent}
                    onEditEntityShowValue={atEditEntityShowValue}
                    onEditEntity={atEditEntity}
                    onEditEntityValue={atEditEntityValue}
                    userSay={step.user}
                    entities={entitiesData}
                    onDeleteEntities={atDeleteEntities}
                  />
                );
              })}
            </div>
          )}
          {/* show examples modal */}
          <div
            className="modal fade"
            id={`show-${step.intent}-examples`}
            tabIndex="-1"
            aria-labelledby={`show-${step.intent}-ExamplesLabel`}
            aria-hidden="true"
            data-bs-backdrop="false"
          >
            <div className="modal-dialog  modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h1
                    className="modal-title fs-5"
                    id={`show-${step.intent}-ExamplesLabel`}
                  >
                    例句
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  {step.examples.length > 0 ? (
                    step.examples.map((example) => {
                      const { text, intent, entities } = example;
                      return (
                        <Examples
                          key={text + intent}
                          text={text}
                          intent={intent}
                          entities={entities}
                          onDeleteExample={atDeleteExample}
                          entitiesData={entitiesData}
                        />
                      );
                    })
                  ) : (
                    <div className="alert alert-warning" role="alert">
                      沒有例句資料，請先添加例句
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    取消
                  </button>
                  <button
                    className="btn btn-primary"
                    data-bs-target={`#add-${step.intent}-example`}
                    data-bs-toggle="modal"
                  >
                    新增例句
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* add example input modal */}
          <div
            className="modal fade"
            id={`add-${step.intent}-example`}
            tabIndex="-1"
            aria-labelledby={`add-${step.intent}-ExampleLabel`}
            aria-hidden="true"
            data-bs-backdrop="false"
          >
            <div className="modal-dialog  modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h1
                    className="modal-title fs-5"
                    id={`add-${step.intent}-ExampleLabel`}
                  >
                    新增例句
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id={`input-${step.intent}-example`}
                      placeholder="請輸入例句"
                    />
                  </div>
                  {entitiesData.length > 0 && (
                    <div className="d-flex flex-column">
                      {entitiesData.map((entityItem) => {
                        return (
                          <div
                            className="mb-3 p-2 border border-success rounded"
                            key={`${entityItem.start}-${entityItem.start}-${entityItem.entity} + ${entityItem.value}`}
                          >
                            <input
                              type="text"
                              className="form-control mb-2"
                              id={`input-${entityItem.entity}-entities-show-value`}
                              placeholder={`請輸入關鍵字代表值為『${entityItem.entity}』的關鍵字`}
                            />
                            <input
                              type="text"
                              className="form-control"
                              id={`input-${entityItem.entity}-entities-value`}
                              placeholder={`請輸入關鍵字代表值為『${entityItem.entity}』的儲存槽值`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-target={`#show-${step.intent}-examples`}
                    data-bs-toggle="modal"
                  >
                    返回
                  </button>
                  <button
                    className="btn btn-primary"
                    data-bs-target={`#show-${step.intent}-examples`}
                    data-bs-toggle="modal"
                    onClick={() =>
                      atCreateExample(step.intent, entitiesData, storyName)
                    }
                  >
                    儲存
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* add branch story */}
          <div
            className="modal fade"
            id="createBranchStoryModal"
            tabIndex="-1"
            aria-labelledby="createBranchStoryModalLabel"
            aria-hidden="true"
            data-bs-backdrop="false"
          >
            <div className="modal-dialog  modal-lg modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h1
                    className="modal-title fs-5"
                    id="createBranchStoryModalLabel"
                  >
                    新增支線故事
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => atCancelCreateBranchStory(actions)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="branchStoryName" className="form-label">
                      支線故事名稱
                    </label>
                    <input
                      className="form-control"
                      id="branchName"
                      name="branchName"
                      placeholder="請輸入支線故事名稱"
                      value={newBranchStory.branchName}
                      onChange={(e) => atChangeNewBranchStory(e)}
                    />
                  </div>
                  {newBranchStory.slotValues.map((slot) => {
                    return (
                      <div className="row border-bottom mb-3" key={slot.id}>
                        <div className="mb-3 col-5">
                          <label htmlFor="slotSelected" className="form-label">
                            記錄槽
                          </label>
                          <select
                            className="form-select"
                            aria-label="slot select"
                            id="slotName"
                            name="slotName"
                            value={slot.slotName}
                            onChange={(e) =>
                              atChangeNewBranchStory(e, slot.id, domain)
                            }
                          >
                            <option value="" hidden disabled>
                              請選擇記錄槽
                            </option>
                            {Object.entries(domain.slots).map((item) => (
                              <option
                                key={`${slot.id}-${item[0]}`}
                                value={item[0]}
                              >
                                {item[0]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-3 col-5">
                          <label htmlFor="slotSelected" className="form-label">
                            儲存槽
                          </label>
                          <select
                            className="form-select"
                            aria-label="slot select"
                            id="slotValue"
                            name="slotValue"
                            value={slot.slotValue}
                            onChange={(e) => atChangeNewBranchStory(e, slot.id)}
                            disabled={!slot.hasSlotValues}
                          >
                            <option value="" hidden>
                              請選擇儲存槽值
                            </option>
                            {domain.slots[slot.slotName]?.type ===
                              'categorical' &&
                              domain.slots[slot.slotName].values.map((item) => {
                                return (
                                  <option
                                    key={`${slot.id}-${item}`}
                                    value={item}
                                  >
                                    {item}
                                  </option>
                                );
                              })}
                          </select>
                        </div>
                        <div className="mb-3 col-2 d-flex justify-content-center align-items-center">
                          <BsTrashFill
                            className={style.removeSlotValueIcon}
                            onClick={() => atRemoveSlotValue(slot.id)}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="d-flex justify-content-center">
                    <CgAddR
                      className={style.addSlotValueSelect}
                      onClick={() => atAddSlotValue()}
                    />
                  </div>

                  {currentStep === 'main' && (
                    <div className="mb-3 col-12">
                      <label htmlFor="botResRadio" className="form-label">
                        選擇回覆方式
                      </label>

                      <div className="mb-3 col-12">
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="resSelect"
                            id="botResRadio"
                            value="botRes"
                            checked={resSelect === 'botRes'}
                            onChange={(e) => atChangeNewBranchStory(e)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="botResRadio"
                          >
                            機器人回覆
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="resSelect"
                            id="branchStoryRadio"
                            value="branchStory"
                            checked={resSelect === 'branchStory'}
                            onChange={(e) => atChangeNewBranchStory(e)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="branchStoryRadio"
                          >
                            串接支線故事
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {resSelect === 'botRes' && (
                    <div className="mb-3">
                      <label htmlFor="branchStoryName" className="form-label">
                        機器人回覆
                      </label>
                      <textarea
                        className="form-control"
                        id="response"
                        name="response"
                        rows={4}
                        placeholder="請輸入機器人回覆"
                        value={newBranchStory.botRes.response}
                        onChange={(e) => atChangeNewBranchStory(e)}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => atCancelCreateBranchStory(actions)}
                  >
                    取消
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      atSubmitNewBranchStory(
                        newBranchStory,
                        stories,
                        newStory,
                        checkPointName,
                      )
                    }
                  >
                    儲存
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserStep);
