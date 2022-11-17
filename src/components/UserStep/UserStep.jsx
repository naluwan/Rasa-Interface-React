import * as React from 'react';
import cx from 'classnames';
import Swal from 'sweetalert2';
import shallow from 'zustand/shallow';
import style from './UserStep.module.scss';
import type { StepsType, NluEntitiesType, NluType, State } from '../types';
import { swalInput, Toast, confirmWidget } from '../../utils/swalInput';
import Entities from '../Entities';
import Examples from './Examples';
import useStoryStore from '../../store/useStoryStore';

type UserStepProps = {
  isCreate: boolean,
  step: StepsType,
  storyName: string,
  onEditExamples: (
    userSay: string,
    intent: string,
    examples: string,
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
    console.log('currentEntities:', currentEntities);
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
    onEditExamples,
    onEditUserSay,
    onEditIntent,
    onCreateEntities,
    onRemoveUserStep,
    onEditEntityShowValue,
    onEditEntity,
    onEditEntityValue,
    onDeleteEntities,
  } = props;

  const { nlu } = useStoryStore((state: State) => {
    return {
      nlu: state.nlu,
    };
  }, shallow);
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
        onEditUserSay(data.ori, data.new, storyName);
      });
    },
    [onEditUserSay, storyName],
  );

  // 編輯意圖
  const atEditIntent = React.useCallback(
    (intent: string) => {
      swalInput('編輯意圖', 'textarea', '請輸入意圖', intent, true).then(
        (data) => {
          if (!data || !data.new || intent === data.new) return;
          onEditIntent(data.ori, data.new, storyName);
        },
      );
    },
    [onEditIntent, storyName],
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
          <input id="currentValue" class="swal2-input" placeholder="請輸入記錄槽代表值" />
          <input id="entity" class="swal2-input" placeholder="請輸入關鍵字代表值" />
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

  // 編輯關鍵字代表值
  const atEditEntity = React.useCallback(
    (stepIntent: string, oriEntity: string, newEntity: string) => {
      onEditEntity(stepIntent, oriEntity, newEntity, storyName);
    },
    [onEditEntity, storyName],
  );

  // 編輯關鍵字
  const atEditEntityValue = React.useCallback(
    (stepIntent: string, oriEntityValue: string, newEntityValue: string) => {
      onEditEntityValue(stepIntent, oriEntityValue, newEntityValue, storyName);
    },
    [onEditEntityValue, storyName],
  );

  // 編輯關鍵字代表值
  const atEditEntity = React.useCallback(
    (stepIntent: string, oriEntity: string, newEntity: string) => {
      onEditEntity(stepIntent, oriEntity, newEntity, storyName);
    },
    [onEditEntity, storyName],
  );

  return (
    <div className="row pt-2" id="userStep">
      <div className={cx('col-6', style.userStepContainer)}>
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
              className="btn btn-primary mx-2"
              onClick={() =>
                atAddExamples(
                  step.user,
                  step.intent,
                  step.examples.toString(),
                  storyName,
                )
              }
            >
              例句
            </button>
            <button
              type="button"
              className="btn btn-outline-info mx-2"
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
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserStep);
