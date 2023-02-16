/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-use-before-define */
/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react';
import cx from 'classnames';
import Swal from 'sweetalert2';
import shallow from 'zustand/shallow';
import uuid from 'react-uuid';
import { CgAddR } from 'react-icons/cg';
// import { createRoot } from 'react-dom/client';
import { BsTrashFill } from 'react-icons/bs';
import style from './UserStep.module.scss';
import type {
  StepsType,
  NluEntitiesType,
  NluType,
  State,
  DomainType,
  StoryType,
  CreateStoryState,
} from '../types';
import { swalInput, Toast, confirmWidget } from '../../utils/swalInput';
import Entities from '../Entities';
import Examples from './Examples';
import useStoryStore from '../../store/useStoryStore';
import { randomBotResAction } from '../../utils/randomBotResAction';
import useCreateStoryStore from '../../store/useCreateStoryStore';
import EntitiesModal from './EntitiesModal';

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
    intent: string,
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

  // const { examples } = step;

  const { nlu, domain, actions, stories, onAddBranchStory, onAddConnectStory } =
    useStoryStore((state: State) => {
      return {
        nlu: state.nlu,
        domain: state.domain,
        actions: state.actions,
        stories: state.stories,
        onAddBranchStory: state.onAddBranchStory,
        onAddConnectStory: state.onAddConnectStory,
      };
    }, shallow);

  const {
    currentStep,
    checkPointName,
    selectedBranchStory,
    onConnectBranchStory,
  } = useCreateStoryStore((state: CreateStoryState) => {
    return {
      currentStep: state.currentStep,
      checkPointName: state.checkPointName,
      selectedBranchStory: state.selectedBranchStory,
      onConnectBranchStory: state.onConnectBranchStory,
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

  const [contentEntity, setContentEntity] = React.useState({
    id: uuid(),
    entity: '',
    value: '',
    start: null,
    end: null,
  });

  const [entitiesArr, setEntitiesArr] = React.useState([]);

  /**
   * @type {[{key:string,slotInfo:{type:string,values?:string[]}}[], Function]}
   */
  const [slots, setSlots] = React.useState([]);

  /**
   * @type {[boolean, Function]}
   */
  const [isEntitiesModalVisible, setIsEntitiesModalVisible] =
    React.useState(false);

  const atToggleEntitiesModal = React.useCallback(() => {
    setIsEntitiesModalVisible((prev) => !prev);
    setContentEntity({
      entity: '',
      value: '',
      start: null,
      end: null,
    });
  }, [setIsEntitiesModalVisible, setContentEntity]);

  const showIntent =
    step.intent === 'get_started' ? '打開聊天室窗' : step.intent;

  const isGetStarted = step.intent === 'get_started';

  // textarea 自適應高度
  const textAreaRef = React.useRef();
  React.useEffect(() => {
    textAreaRef.current.style = 'height:0px';
    textAreaRef.current.value = step.user;
    textAreaRef.current.style = `height: ${textAreaRef.current.scrollHeight}px`;
  }, [step.user]);

  // 重組entities資料
  const entitiesData = React.useMemo(() => {
    return filteredEntities(step.entities, step.user, step.intent, nlu);
  }, [step.entities, step.user, step.intent, nlu]);

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

  // 例句檢核
  const atCreateExample = React.useCallback(
    (
      intent: string,
      parentEntitiesData: NluEntitiesType[],
      currentStoryName: string,
    ) => {
      console.log(intent);
      const exampleValue = document.querySelector(
        `#input-${intent}-example`,
      ).value;
      console.log('exampleValue ===> ', exampleValue);
      const entityKeys = parentEntitiesData.map(
        (entityItem) => entityItem.entity,
      );
      console.log(entityKeys);
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
      console.log(entitiesValue);
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

  // steven start
  // 新增例句
  // const atCreateExamples = React.useCallback(() => {
  //   Swal.fire({
  //     title: '新增例句',
  //     html: "<div id='CreateExample'></div>",
  //     showCloseButton: true,
  //     showCancelButton: true,
  //     focusConfirm: false,
  //     confirmButtonText: '儲存',
  //     cancelButtonText: '返回',
  //     confirmButtonAriaLabel: 'Thumbs up, great!',
  //     cancelButtonAriaLabel: 'Thumbs down',
  //     closeOnConfirm: false,
  //     reverseButtons: true,
  //     closeOnCancel: false,
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       atCreateExample(step.intent, entitiesData, storyName);
  //     } else {
  //       setTimeout(() => {
  //         document.querySelector('#examplesBtn').click();
  //       }, 0);
  //     }
  //   });

  //   setTimeout(() => {
  //     let CreateExamples = '';
  //     CreateExamples = (
  //       <div className="modal-body">
  //         <div className="mb-3">
  //           <input
  //             type="text"
  //             className="form-control"
  //             id={`input-${step.intent}-example`}
  //             placeholder="請輸入例句"
  //           />
  //         </div>
  //         {entitiesData.length > 0 && (
  //           <div className="d-flex flex-column">
  //             {entitiesData.map((entityItem) => {
  //               return (
  //                 <div
  //                   className="mb-3 p-2 border border-success rounded"
  //                   key={`${entityItem.start}-${entityItem.start}-${entityItem.entity}-${entityItem.value}`}
  //                 >
  //                   <input
  //                     type="text"
  //                     className="form-control mb-2"
  //                     id={`input-${entityItem.entity}-entities-show-value`}
  //                     placeholder={`請輸入關鍵字代表值為『${entityItem.entity}』的關鍵字`}
  //                   />
  //                   <input
  //                     type="text"
  //                     className="form-control"
  //                     id={`input-${entityItem.entity}-entities-value`}
  //                     placeholder={`請輸入關鍵字代表值為『${entityItem.entity}』的儲存槽值`}
  //                   />
  //                 </div>
  //               );
  //             })}
  //           </div>
  //         )}
  //       </div>
  //     );
  //     createRoot(document.getElementById('CreateExample')).render(
  //       CreateExamples,
  //     );
  //   }, 0);
  // }, []);

  // 編輯例句
  // const atexampleBtn = React.useCallback(() => {
  //   Swal.fire({
  //     title: '例句',
  //     html: "<div id='examplesTable'> 沒有例句資料，請先添加例句</div>",
  //     width: 1000,
  //     showCloseButton: true,
  //     showCancelButton: true,
  //     focusConfirm: false,
  //     confirmButtonText: '新增例句',
  //     cancelButtonText: '取消',
  //     confirmButtonAriaLabel: 'Thumbs up, great!',
  //     cancelButtonAriaLabel: 'Thumbs down',
  //     preConfirm: () => {
  //       atCreateExamples();
  //     },
  //   });
  //   // inner Dynamic Content
  //   setTimeout(() => {
  //     console.log('setTimeout');

  //     let extable = '';
  //     let render = false;
  //     if (examples.length > 0) {
  //       extable = (
  //         <div>
  //           <table>
  //             <thead>
  //               <tr className={cx(style.tblHead, style.tblHeader)}>
  //                 <th className={cx(style.tblHead)} rowSpan="2">
  //                   例句
  //                 </th>
  //                 <th className={cx(style.tblHead)} rowSpan="2">
  //                   關鍵字
  //                 </th>
  //                 <th className={cx(style.tblHead)} rowSpan="2">
  //                   儲存槽
  //                 </th>
  //                 <th className={cx(style.tblHead)} rowSpan="2">
  //                   紀錄槽
  //                 </th>
  //                 <th className={cx(style.tblHead)} rowSpan="2">
  //                   操作
  //                 </th>
  //               </tr>
  //             </thead>

  //             <tbody>
  //               {examples.map((example) => {
  //                 const { text, intent, entities } = example;
  //                 console.log('example text ===> ', text);
  //                 console.log('example intent ===> ', intent);
  //                 console.log('example entities ===> ', entities);
  //                 return (
  //                   <Examples
  //                     key={text + intent}
  //                     text={text}
  //                     intent={intent}
  //                     entities={entities}
  //                     onDeleteExample={atDeleteExample}
  //                     entitiesData={entitiesData}
  //                   />
  //                 );
  //               })}
  //             </tbody>
  //           </table>
  //         </div>
  //       );
  //       render = true;
  //     } else {
  //       extable = (
  //         <div className="alert alert-warning" role="alert">
  //           沒有例句資料，請先添加例句
  //         </div>
  //       );
  //       render = true;
  //     }
  //     if (render === true) {
  //       console.log('render');
  //       let examplesTable = '';
  //       examplesTable = document.getElementById('examplesTable');
  //       if (examplesTable) {
  //         createRoot(examplesTable).render(extable);
  //       } else {
  //         document.querySelector('#examplesBtn').click();
  //       }
  //     } else {
  //       document.querySelector('#examplesBtn').click();
  //     }
  //   }, 0);
  // }, [examples]);

  // steven end
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
            const regex = /^[0-9]*$/;

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
      currentStoryName: string,
      branchStoryName: string,
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

      if (newBranchStoryInfo.branchName.indexOf('_') > -1) {
        newBranchStoryInfo.branchName = '';
        setNewBranchStory((prev) => {
          return {
            ...prev,
            branchName: '',
          };
        });
        Toast.fire({
          icon: 'warning',
          title: '支線故事名稱不能含有底線',
        });
        document.querySelector('#createBranchStoryModal #branchName').focus();
        return;
      }

      let isRepeat = false;
      let checkBranchStoryName = '';
      if (currentStep === 'main') {
        checkBranchStoryName = `${currentStoryName}_${newBranchStoryInfo.branchName}`;
      } else {
        checkBranchStoryName = `${branchStoryName}_${newBranchStoryInfo.branchName}`;
      }

      isRepeat = storiesData.some(
        (item) => item.story === checkBranchStoryName,
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

      if (isCreate) {
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
                      if (
                        curConnectStoryName === newBranchStoryInfo.branchName
                      ) {
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
      }

      if (currentStep === 'main') {
        if (!isCreate) {
          onAddBranchStory(currentStoryName, newBranchStoryInfo);
        } else {
          onCreateBranchStory(newBranchStoryInfo);
        }
      }

      if (currentStep === 'branchStory') {
        if (!isCreate) {
          onAddConnectStory(
            currentStoryName,
            branchStoryName,
            newBranchStoryInfo,
          );
        } else {
          onConnectBranchStory(newStoryData, newBranchStoryInfo);
        }
      }

      setResSelect('botRes');
      document.querySelector('#createBranchStoryModal .swal2-close').click();
    },
    [
      onCreateBranchStory,
      onConnectBranchStory,
      onAddBranchStory,
      onAddConnectStory,
      resSelect,
      currentStep,
      isCreate,
    ],
  );

  // 獲取使用者選取文字
  const getSelectText = React.useCallback(() => {
    const userSayEle = document.querySelector('#userSay');
    if (userSayEle) {
      // 檢查選取的文字是否重疊
      const isRepeat = entitiesData.some(
        (entitiesItem) =>
          (entitiesItem.start <= userSayEle.selectionStart &&
            userSayEle.selectionStart <= entitiesItem.end - 1) ||
          (entitiesItem.start <= userSayEle.selectionEnd - 1 &&
            userSayEle.selectionEnd - 1 <= entitiesItem.end),
      );
      if (isRepeat) {
        return Toast.fire({
          icon: 'warning',
          title: '關鍵字不可重疊',
        });
      }

      return {
        text: userSayEle.value.substring(
          userSayEle.selectionStart,
          userSayEle.selectionEnd,
        ),
        start: userSayEle.selectionStart,
        end: userSayEle.selectionEnd,
      };
    }
    return {};
  }, []);

  // 滑鼠左鍵彈起事件
  const atMouseSelection = React.useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      if (getSelectText().text && e.button === 0) {
        if (getSelectText().end - getSelectText().start <= 1) {
          Toast.fire({
            icon: 'warning',
            title: '關鍵字至少要有兩個字',
          });
          return;
        }
        // setContentEntity((prev) => {
        //   return {
        //     ...prev,
        //     start: getSelectText().start,
        //     end: getSelectText().end,
        //   };
        // });
        const entityData = {
          id: uuid(),
          entity: '',
          value: '',
          start: getSelectText().start,
          end: getSelectText().end,
          synonyms: [],
        };
        setEntitiesArr((prev) => prev.concat([entityData]));
        setIsEntitiesModalVisible((prev) => !prev);
      }
    },
    [setIsEntitiesModalVisible, setEntitiesArr],
  );

  // const atSubmitEntities = React.useCallback(() => {
  //   contentEntity.map;
  // });

  // console.log('entitiesData:', entitiesData);
  // console.log('newBranchStory:', newBranchStory);
  // console.log('resSelect ========================>', resSelect);
  // console.log('story ======> ', story);

  return (
    <div className="row pt-2" id="userStep">
      <div
        className={cx('col-sm-12 col-md-12 col-lg-6', style.userStepContainer)}
      >
        {!isGetStarted && (
          <div className={cx('py-2')}>
            <button
              type="button"
              className={cx('btn', style.editBtn, style.mr2, style.mt2)}
              onClick={() => atEditUserSay(step.user)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 19H6.4L15.025 10.375L13.625 8.975L5 17.6V19ZM19.3 8.925L15.05 4.725L16.45 3.325C16.8333 2.94167 17.3043 2.75 17.863 2.75C18.421 2.75 18.8917 2.94167 19.275 3.325L20.675 4.725C21.0583 5.10833 21.2583 5.571 21.275 6.113C21.2917 6.65433 21.1083 7.11667 20.725 7.5L19.3 8.925ZM17.85 10.4L7.25 21H3V16.75L13.6 6.15L17.85 10.4ZM14.325 9.675L13.625 8.975L15.025 10.375L14.325 9.675Z"
                  fill="black"
                />
              </svg>
              <div>編輯</div>
            </button>
            <button
              type="button"
              className={cx('btn ', style.intentionBtn, style.mr2, style.mt2)}
              onClick={() => atEditIntent(step.intent)}
            >
              <svg
                width="20"
                height="22"
                viewBox="0 0 20 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.9788 2C14.8788 2 17.9788 5.1 17.9788 9C17.9788 11.8 16.3788 14.2 13.9788 15.3V20H6.97878V17H5.97878C4.87878 17 3.97878 16.1 3.97878 15V12H2.47878C2.07878 12 1.77878 11.5 2.07878 11.2L3.97878 8.7C4.17878 4.9 7.17878 2 10.9788 2ZM10.9788 0C6.37878 0 2.57878 3.4 2.07878 7.9L0.478775 10C-0.121225 10.8 -0.121225 11.8 0.278775 12.6C0.678775 13.3 1.27878 13.8 1.97878 13.9V15C1.97878 16.9 3.27878 18.4 4.97878 18.9V22H15.9788V16.5C18.4788 14.8 19.9788 12.1 19.9788 9C19.9788 4 15.9788 0 10.9788 0ZM11.9788 13H9.97878V12H11.9788V13ZM13.5788 8.5C13.2788 8.9 12.9788 9.3 12.4788 9.6V11H9.47878V9.6C8.07878 8.8 7.57877 6.9 8.37877 5.5C9.17877 4.1 11.0788 3.6 12.4788 4.4C13.8788 5.2 14.3788 7.1 13.5788 8.5Z"
                  fill="black"
                />
              </svg>
              意圖
            </button>
            <button
              type="button"
              className={cx('btn', style.exampleBtn, style.mr2, style.mt2)}
              data-bs-toggle="modal"
              data-bs-target={`#show-${step.intent}-examples`}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.0002 24H21.0002V26H11.0002V24ZM13.0002 28H19.0002V30H13.0002V28ZM16.0002 2C13.348 2 10.8045 3.05357 8.9291 4.92893C7.05374 6.8043 6.00017 9.34784 6.00017 12C5.93254 13.4533 6.21094 14.902 6.81246 16.2267C7.41399 17.5514 8.32144 18.7144 9.46017 19.62C10.4602 20.55 11.0002 21.08 11.0002 22H13.0002C13.0002 20.16 11.8902 19.13 10.8102 18.14C9.87553 17.4243 9.13064 16.4903 8.64075 15.4198C8.15086 14.3494 7.93091 13.1752 8.00017 12C8.00017 9.87827 8.84302 7.84344 10.3433 6.34315C11.8436 4.84285 13.8784 4 16.0002 4C18.1219 4 20.1567 4.84285 21.657 6.34315C23.1573 7.84344 24.0002 9.87827 24.0002 12C24.0683 13.176 23.8468 14.3508 23.3551 15.4213C22.8635 16.4918 22.1166 17.4253 21.1802 18.14C20.1102 19.14 19.0002 20.14 19.0002 22H21.0002C21.0002 21.08 21.5302 20.55 22.5402 19.61C23.6781 18.706 24.5851 17.5447 25.1867 16.2217C25.7882 14.8987 26.067 13.4518 26.0002 12C26.0002 10.6868 25.7415 9.38642 25.239 8.17317C24.7364 6.95991 23.9998 5.85752 23.0712 4.92893C22.1426 4.00035 21.0403 3.26375 19.827 2.7612C18.6137 2.25866 17.3134 2 16.0002 2V2Z"
                  fill="black"
                />
              </svg>
              例句
            </button>
            {/* steven測試-start */}
            {/* <button
              type="button"
              className={cx('btn', style.exampleBtn, style.mr2, style.mt2)}
              id="examplesBtn"
              onClick={() => atexampleBtn(examples)}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.0002 24H21.0002V26H11.0002V24ZM13.0002 28H19.0002V30H13.0002V28ZM16.0002 2C13.348 2 10.8045 3.05357 8.9291 4.92893C7.05374 6.8043 6.00017 9.34784 6.00017 12C5.93254 13.4533 6.21094 14.902 6.81246 16.2267C7.41399 17.5514 8.32144 18.7144 9.46017 19.62C10.4602 20.55 11.0002 21.08 11.0002 22H13.0002C13.0002 20.16 11.8902 19.13 10.8102 18.14C9.87553 17.4243 9.13064 16.4903 8.64075 15.4198C8.15086 14.3494 7.93091 13.1752 8.00017 12C8.00017 9.87827 8.84302 7.84344 10.3433 6.34315C11.8436 4.84285 13.8784 4 16.0002 4C18.1219 4 20.1567 4.84285 21.657 6.34315C23.1573 7.84344 24.0002 9.87827 24.0002 12C24.0683 13.176 23.8468 14.3508 23.3551 15.4213C22.8635 16.4918 22.1166 17.4253 21.1802 18.14C20.1102 19.14 19.0002 20.14 19.0002 22H21.0002C21.0002 21.08 21.5302 20.55 22.5402 19.61C23.6781 18.706 24.5851 17.5447 25.1867 16.2217C25.7882 14.8987 26.067 13.4518 26.0002 12C26.0002 10.6868 25.7415 9.38642 25.239 8.17317C24.7364 6.95991 23.9998 5.85752 23.0712 4.92893C22.1426 4.00035 21.0403 3.26375 19.827 2.7612C18.6137 2.25866 17.3134 2 16.0002 2V2Z"
                  fill="black"
                />
              </svg>
              例句
            </button> */}
            {/* steven測試-End */}
            <button
              type="button"
              className={cx(
                'btn ',
                style.keyWordBtn,
                style.mr2,
                style.mt2,
                style.keyWordBtnMr,
              )}
              onClick={() =>
                atCreateEntities(
                  step.user,
                  step.intent,
                  entitiesData,
                  storyName,
                )
              }
            >
              <svg
                width="22"
                height="12"
                viewBox="0 0 22 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 12C4.33333 12 2.91667 11.4167 1.75 10.25C0.583333 9.08333 0 7.66667 0 6C0 4.33333 0.583333 2.91667 1.75 1.75C2.91667 0.583333 4.33333 0 6 0C7.1 0 8.10833 0.275 9.025 0.825C9.94167 1.375 10.6667 2.1 11.2 3H22V9H20V12H14V9H11.2C10.6667 9.9 9.94167 10.625 9.025 11.175C8.10833 11.725 7.1 12 6 12ZM6 10C7.1 10 7.98333 9.66267 8.65 8.988C9.31667 8.31267 9.71667 7.65 9.85 7H16V10H18V7H20V5H9.85C9.71667 4.35 9.31667 3.68733 8.65 3.012C7.98333 2.33733 7.1 2 6 2C4.9 2 3.95833 2.39167 3.175 3.175C2.39167 3.95833 2 4.9 2 6C2 7.1 2.39167 8.04167 3.175 8.825C3.95833 9.60833 4.9 10 6 10ZM6 8C6.55 8 7.02067 7.804 7.412 7.412C7.804 7.02067 8 6.55 8 6C8 5.45 7.804 4.979 7.412 4.587C7.02067 4.19567 6.55 4 6 4C5.45 4 4.97933 4.19567 4.588 4.587C4.196 4.979 4 5.45 4 6C4 6.55 4.196 7.02067 4.588 7.412C4.97933 7.804 5.45 8 6 8Z"
                  fill="black"
                />
              </svg>
              關鍵字
            </button>
            {isCreate && (
              <button
                type="button"
                className={cx('btn btn-danger mx-2 mt-2', style.deleteBtn)}
                onClick={() => onRemoveUserStep(step.intent, step.user)}
              >
                刪除
              </button>
            )}
            <button
              type="button"
              className="entityModalBtn"
              data-bs-toggle="modal"
              data-bs-target="#entityModal"
            >
              按鈕
            </button>
            <hr />
          </div>
        )}
        <div className="d-flex flex-column">
          <div className="d-flex align-items-center pt-2">
            <div className={style.userTitle}>使用者:</div>
            <textarea
              className={style.userText}
              id="userSay"
              ref={textAreaRef}
              onMouseUp={(e) => atMouseSelection(e)}
              value={step.user ? step.user : showIntent}
              rows={1}
              readOnly
            />
          </div>
          <div className="d-flex align-items-center pt-2 intentContainer">
            <div className={cx('intentContainer', style.userTitle)}>意圖:</div>
            <div className={cx('intentContainer', style.userText)}>
              {step.intent}
            </div>
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
            className="modal"
            id={`show-${step.intent}-examples`}
            tabIndex="-1"
            aria-labelledby={`show-${step.intent}-ExamplesLabel`}
            aria-hidden="true"
            data-bs-backdrop="false"
          >
            <div className="modal-dialog  modal-lg modal-dialog-scrollable">
              <div className={cx('modal-content swal2-show', style.swtOut)}>
                <div>
                  <h1
                    className="swal2-title"
                    id={`show-${step.intent}-ExamplesLabel`}
                  >
                    例句
                  </h1>
                  <button
                    type="button"
                    className={cx('swal2-close', style.swetClose)}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <table>
                    {step.examples.length > 0 && (
                      <thead>
                        <tr className={cx(style.tblHead, style.tblHeader)}>
                          <th className={cx(style.tblHead)} rowSpan="2">
                            例句
                          </th>
                          <th className={cx(style.tblHead)} rowSpan="2">
                            關鍵字
                          </th>
                          <th className={cx(style.tblHead)} rowSpan="2">
                            儲存槽
                          </th>
                          <th className={cx(style.tblHead)} rowSpan="2">
                            紀錄槽
                          </th>
                          <th className={cx(style.tblHead)} rowSpan="2">
                            操作
                          </th>
                        </tr>
                      </thead>
                    )}
                    <tbody>
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
                        <tr>
                          <td className="alert alert-warning" role="alert">
                            沒有例句資料，請先添加例句
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="swal2-actions d-flex">
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="swal2-cancel swal2-styled"
                      data-bs-dismiss="modal"
                    >
                      取消
                    </button>
                    <button
                      className="swal2-confirm swal2-styled"
                      data-bs-target={`#add-${step.intent}-example`}
                      data-bs-toggle="modal"
                    >
                      新增例句
                    </button>
                  </div>
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

          {/* add branch story modal */}
          <div
            className="modal"
            id="createBranchStoryModal"
            tabIndex="-1"
            aria-labelledby="createBranchStoryModalLabel"
            aria-hidden="true"
            data-bs-backdrop="false"
          >
            <div className="modal-dialog  modal-lg modal-dialog-scrollable">
              <div className={cx('modal-content swal2-show', style.swtOut)}>
                <div>
                  <h2 className="swal2-title" id="createBranchStoryModalLabel">
                    新增支線故事
                  </h2>
                  <button
                    type="button"
                    className={cx('swal2-close', style.swetClose)}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => atCancelCreateBranchStory(actions)}
                  >
                    ×
                  </button>
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
                            <option value="null">null</option>
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
                <div className="swal2-actions d-flex">
                  <button
                    type="button"
                    className="swal2-cancel swal2-styled"
                    data-bs-dismiss="modal"
                    onClick={() => atCancelCreateBranchStory(actions)}
                  >
                    取消
                  </button>
                  <button
                    className="swal2-confirm swal2-styled"
                    onClick={() =>
                      atSubmitNewBranchStory(
                        newBranchStory,
                        stories,
                        newStory,
                        checkPointName,
                        storyName,
                        selectedBranchStory.story,
                      )
                    }
                  >
                    儲存
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* entity modal */}
          {/* <div
            className="modal fade"
            id="entityModal"
            tabIndex="-1"
            aria-labelledby="entityModalLabel"
            aria-hidden="true"
            data-bs-backdrop="false"
          >
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
              <div className={cx('modal-content swal2-show', style.swtOut)}>
                <div className={style.modalHeader}>
                  <h1 className="swal2-title" id="entityModalLabel">
                    關鍵字
                  </h1>
                  <button
                    type="button"
                    className={cx('swal2-close', style.swetClose)}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    x
                  </button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="slotName" className="form-label">
                      標籤類別
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="slotName"
                      placeholder="請輸入標籤類別名稱"
                    />
                    <select
                      className="form-control"
                      name="slotCategory"
                      id="slotCategory"
                    >
                      <option value="">建立標籤類別</option>
                      {slots.map((slot) => (
                        <option key={slot.key} value={slot.key}>
                          {slot.key}
                        </option>
                      ))}
                    </select>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">標籤</th>
                        <th scope="col">同義字</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{contentEntity.text}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="swal2-actions d-flex">
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="swal2-cancel swal2-styled"
                      data-bs-dismiss="modal"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      className="swal2-confirm swal2-styled"
                    >
                      儲存
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <EntitiesModal
        title="關鍵字"
        isVisible={isEntitiesModalVisible}
        onClose={atToggleEntitiesModal}
        slots={slots}
        contentEntity={contentEntity}
        onSetContentEntity={setContentEntity}
        entitiesData={entitiesData}
        entitiesArr={entitiesArr}
        onSetEntitiesArr={setEntitiesArr}
      />
    </div>
  );
};

export default React.memo(UserStep);
