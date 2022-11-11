import * as React from 'react';
import cx from 'classnames';
import Swal from 'sweetalert2';
import style from './UserStep.module.scss';
import type { StepsType, NluEntitiesType } from '../types';
import { swalInput, Toast, confirmWidget } from '../../utils/swalInput';
import Entities from '../Entities';

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
    storyName: string,
  ) => void,
  onRemoveUserStep: (intent: string, userSay: string) => void,
  onEditEntityValue: (
    stepIntent: string,
    oriEntityValue: string,
    newEntityValue: string,
  ) => void,
  onEditEntity: (
    stepIntent: string,
    oriEntity: string,
    newEntity: string,
  ) => void,
  onDeleteEntities: (
    entityValue: string,
    intent: string,
    storyName?: string,
  ) => void,
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
    onEditEntityValue,
    onEditEntity,
    onDeleteEntities,
  } = props;
  const showIntent =
    step.intent === 'get_started' ? '打開聊天室窗' : step.intent;

  const isGetStarted = step.intent === 'get_started';
  // 編輯例句
  const atAddExamples = React.useCallback(
    (
      userSay: string,
      intent: string,
      examples: string,
      currentStoryName: string | null,
    ) => {
      swalInput('新增例句', 'textarea', '請輸入例句', examples, true).then(
        (newExamples) => {
          if (newExamples === undefined || newExamples === examples) return;
          onEditExamples(userSay, intent, newExamples, currentStoryName);
        },
      );
    },
    [onEditExamples],
  );

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
          <input id="value" class="swal2-input" placeholder="請輸入關鍵字" />
          <input id="entity" class="swal2-input" placeholder="請輸入關鍵字代表值" />
        `,
        preConfirm: () => {
          return new Promise((resolve) => {
            Swal.enableButtons();
            // 獲取關鍵字(value)和關鍵字代表值(entity)
            const { value } = document.querySelector('.swal2-input#value');
            const entity = document.querySelector('.swal2-input#entity').value;
            // 獲取關鍵字的起點和終點
            const start = userSay.indexOf(value);
            const end = userSay.indexOf(value) + value.length;
            // 驗證關鍵字代表值是否有數字
            const regex = /^[0-9]*$/g;

            // 都沒值
            if (value === '' && entity === '') {
              return;
            }

            // 有一個欄位沒值
            if (value === '' || entity === '') {
              Swal.showValidationMessage(`所有欄位都是必填的`);
              return;
            }

            // 關鍵字不在對話內
            if (!userSay.includes(value)) {
              Swal.showValidationMessage(`請填入正確的關鍵字`);
              document.querySelector('.swal2-input#value').value = '';
              return;
            }

            // 關鍵字代表值有數字
            if (regex.test(entity)) {
              Swal.showValidationMessage(`關鍵字代表值不可為數字`);
              document.querySelector('.swal2-input#entity').value = '';
              return;
            }

            // 獲取所有entities的key值
            const entitiesKeys = currentEntities.map((item) =>
              Object.keys(item),
            );

            // 查詢故事頁，將entities傳進來時是沒有處理過的，所以這邊要再處理一次，否則無法驗證關鍵字是否重疊
            if (
              currentEntities.length &&
              entitiesKeys.every((item) =>
                item.every((keyItem) => keyItem !== 'start'),
              )
            ) {
              currentEntities.map((item) => {
                item.start = userSay.indexOf(Object.values(item)[0]);
                item.end = item.start + Object.values(item)[0].length;
                [item.entity] = Object.keys(item);
                [item.value] = Object.values(item);
                return item;
              });
            }

            if (currentEntities.length) {
              // 驗證關鍵字是否重疊
              const isRepeat = currentEntities.some(
                (currentEntitiesItem) =>
                  (currentEntitiesItem.start <= start &&
                    start <= currentEntitiesItem.end - 1) ||
                  (currentEntitiesItem.start <= end &&
                    end <= currentEntitiesItem.end),
              );

              if (isRepeat) {
                Swal.showValidationMessage(`關鍵字不可重疊`);
                document.querySelector('.swal2-input#value').value = '';
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
            }

            const entities = { start, end, entity, value };
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

  const atDeleteEntities = React.useCallback(
    (entityValue: string, intent: string) => {
      confirmWidget(entityValue, 'deleteEntities').then((result) => {
        if (!result.isConfirmed) return;

        onDeleteEntities(entityValue, intent, storyName);
      });
    },
    [onDeleteEntities, storyName],
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
                  step.entities,
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
          {step.entities.length > 0 && (
            <div className="d-flex flex-column pt-2">
              <div className={style.userTitle}>關鍵字:</div>
              {step.entities.map((entityItem) => {
                let entity = '';
                let entityValue = '';
                if (isCreate) {
                  entity = entityItem.entity;
                  entityValue = entityItem.value;
                } else {
                  [entity] = Object.keys(entityItem);
                  [entityValue] = Object.values(entityItem);
                }
                return (
                  <Entities
                    key={entity + entityValue}
                    entity={entity}
                    entityValue={entityValue}
                    intent={step.intent}
                    onEditEntityValue={onEditEntityValue}
                    onEditEntity={onEditEntity}
                    userSay={step.user}
                    entities={step.entities}
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
