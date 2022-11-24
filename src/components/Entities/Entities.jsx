import * as React from 'react';
import style from './Entities.module.scss';
// import { Toast } from '../../utils/swalInput';

type EntitiesProps = {
  entity: string,
  entityValue: string,
  intent: string,
  userSay: string,
  entities: { start: number, end: number, value: string, entity: string }[],
  entityShowValue: string,
  onEditEntityShowValue: (
    stepIntent: string,
    currentEntityValue: string,
    newEntityShowValue: string,
  ) => void,
  onEditEntity: (
    stepIntent: string,
    oriEntity: string,
    newEntity: string,
  ) => void,
  onEditEntityValue: (
    stepIntent: string,
    oriEntityValue: string,
    newEntityValue: string,
  ) => void,
  onDeleteEntities: (
    entity: string,
    entityValue: string,
    intent: string,
  ) => void,
};

const Entities: React.FC<EntitiesProps> = (props) => {
  const {
    entity,
    entityValue,
    intent,
    userSay,
    entities,
    entityShowValue,
    onEditEntityShowValue,
    onEditEntity,
    onEditEntityValue,
    onDeleteEntities,
  } = props;
  const [showValue, setShowValue] = React.useState(false);
  const [showEntity, setShowEntity] = React.useState(false);
  const [showCurValue, setShowCurValue] = React.useState(false);
  const [entityItem, setEntityItem] = React.useState({
    entity,
    entityValue,
    entityShowValue,
  });
  /**
   * @type {React.MutableRefObject<HTMLInputElement>}
   */
  const refValueInput = React.useRef();

  /**
   * @type {React.MutableRefObject<HTMLInputElement>}
   */
  const refEntityInput = React.useRef();

  /**
   * @type {React.MutableRefObject<HTMLInputElement>}
   */
  const refCurValueInput = React.useRef();

  // 透過ref控制input顯示後自動focus
  React.useEffect(() => {
    if (showValue) {
      refValueInput.current.focus();
    }
    if (showEntity) {
      refEntityInput.current.focus();
    }
    if (showCurValue) {
      refCurValueInput.current.focus();
    }
  }, [showValue, showEntity, showCurValue]);

  // 意圖按鈕，點擊後顯示編輯輸入框
  const atShowClick = React.useCallback(
    (e) => {
      if (e.target.id === 'entityShowValue') {
        setShowValue((prev) => !prev);
      } else if (e.target.id === 'entity') {
        setShowEntity((prev) => !prev);
      } else {
        setShowCurValue((prev) => !prev);
      }
    },
    [setShowValue, setShowEntity],
  );

  // 關鍵字位置按鍵和失焦事件
  const atEntityShowValueKeyDown = React.useCallback(
    (
      e,
      stepIntent: string,
      currentEntityValue: string,
      oriEntityShowValue: string,
      newEntityShowValue: string,
    ) => {
      if (e.key === 'Enter' || e.type === 'blur') {
        if (oriEntityShowValue !== newEntityShowValue) {
          const isValid = userSay.includes(newEntityShowValue);
          const isRepeat = entities.some((item) => {
            if (item.value !== currentEntityValue) {
              if (
                (item.start <= userSay.indexOf(newEntityShowValue) &&
                  userSay.indexOf(newEntityShowValue) < item.end) ||
                (item.start <
                  userSay.indexOf(newEntityShowValue) +
                    newEntityShowValue.length &&
                  userSay.indexOf(newEntityShowValue) +
                    newEntityShowValue.length <=
                    item.end)
              ) {
                return true;
              }
            }
            return false;
          });
          if (!isValid || isRepeat || newEntityShowValue === '') {
            setEntityItem((prev) => {
              return {
                ...prev,
                entityShowValue: oriEntityShowValue,
              };
            });
          }
          if (newEntityShowValue !== '') {
            onEditEntityShowValue(
              stepIntent,
              currentEntityValue,
              newEntityShowValue,
            );
          }
        }
        setShowValue((prev) => !prev);
      }
    },
    [setShowValue, onEditEntityShowValue, userSay, entities],
  );

  // 關鍵字代表值按鍵和失焦事件
  const atEntityKeyDown = React.useCallback(
    (e, stepIntent: string, oriEntity: string, newEntity: string) => {
      if (e.key === 'Enter' || e.type === 'blur') {
        if (oriEntity !== newEntity) {
          // 驗證關鍵字代表值是否有數字
          const regex = /^[0-9]*$/g;
          // 驗證關鍵字是否在同一個對話內重複
          const isRepeat = entities.some((item) => item.entity === newEntity);
          if (isRepeat || regex.test(newEntity) || newEntity === '') {
            setEntityItem((prev) => {
              return {
                ...prev,
                entity: oriEntity,
              };
            });
          }
          if (newEntity !== '') {
            onEditEntity(stepIntent, oriEntity, newEntity);
          }
        }
        setShowEntity((prev) => !prev);
      }
    },
    [setShowEntity, onEditEntity, entities],
  );

  // 關鍵字按鍵和失焦事件
  const atEntityValueKeyDown = React.useCallback(
    (e, stepIntent: string, oriEntityValue: string, newEntityValue: string) => {
      if (e.key === 'Enter' || e.type === 'blur') {
        if (oriEntityValue !== newEntityValue) {
          const isRepeat = entities.some(
            (item) => item.value === newEntityValue,
          );
          if (isRepeat || newEntityValue === '') {
            setEntityItem((prev) => {
              return {
                ...prev,
                entityValue: oriEntityValue,
              };
            });
          }

          if (newEntityValue !== '') {
            onEditEntityValue(stepIntent, oriEntityValue, newEntityValue);
          }
        }
        setShowCurValue((prev) => !prev);
      }
    },
    [setShowCurValue, onEditEntityValue, entities],
  );

  // input事件，輸入文字即時改變值
  const atChange = React.useCallback(
    (e) => {
      const { name, value } = e.target;
      setEntityItem((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    },
    [setEntityItem],
  );

  return (
    <div className={style.root}>
      <div className={style.info}>
        <div className="py-2">
          <label htmlFor="entityShowValue" className={style.label}>
            關鍵字：
          </label>
          {showValue ? (
            <input
              type="text"
              id="entityShowValue"
              name="entityShowValue"
              defaultValue={entityItem.entityShowValue}
              ref={refValueInput}
              onChange={atChange}
              onKeyDown={(e) =>
                atEntityShowValueKeyDown(
                  e,
                  intent,
                  entityValue,
                  entityShowValue,
                  entityItem.entityShowValue,
                )
              }
              onBlur={(e) =>
                atEntityShowValueKeyDown(
                  e,
                  intent,
                  entityValue,
                  entityShowValue,
                  entityItem.entityShowValue,
                )
              }
            />
          ) : (
            <button
              className="btn btn-outline-light"
              id="entityShowValue"
              onClick={atShowClick}
            >
              {entityItem.entityShowValue}
            </button>
          )}
        </div>
        <div className="py-2">
          <label htmlFor="entityValue" className={style.label}>
            儲存槽代表值：
          </label>
          {showCurValue ? (
            <input
              type="text"
              id="entityValue"
              name="entityValue"
              defaultValue={entityItem.entityValue}
              ref={refCurValueInput}
              onChange={(e) => atChange(e)}
              onKeyDown={(e) =>
                atEntityValueKeyDown(
                  e,
                  intent,
                  entityValue,
                  entityItem.entityValue,
                )
              }
              onBlur={(e) =>
                atEntityValueKeyDown(
                  e,
                  intent,
                  entityValue,
                  entityItem.entityValue,
                )
              }
            />
          ) : (
            <button
              className="btn btn-outline-warning"
              id="entityValue"
              onClick={atShowClick}
            >
              {entityItem.entityValue}
            </button>
          )}
        </div>
        <div className="py-2">
          <label htmlFor="entity" className={style.label}>
            記錄槽名稱：
          </label>
          {showEntity ? (
            <input
              type="text"
              id="entity"
              name="entity"
              defaultValue={entityItem.entity}
              ref={refEntityInput}
              onChange={(e) => atChange(e)}
              onKeyDown={(e) =>
                atEntityKeyDown(e, intent, entity, entityItem.entity)
              }
              onBlur={(e) =>
                atEntityKeyDown(e, intent, entity, entityItem.entity)
              }
            />
          ) : (
            <button
              className="btn btn-outline-primary"
              id="entity"
              onClick={atShowClick}
            >
              {entityItem.entity}
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        className="btn btn-outline-danger align-self-center"
        onClick={() => onDeleteEntities(entity, entityValue, intent)}
      >
        刪除關鍵字
      </button>
    </div>
  );
};

export default React.memo(Entities);
