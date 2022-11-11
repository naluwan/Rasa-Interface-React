import * as React from 'react';
import style from './Entities.module.scss';
// import { Toast } from '../../utils/swalInput';

type EntitiesProps = {
  entity: string,
  entityValue: string,
  intent: string,
  userSay: string,
  entities: { start: number, end: number, value: string, entity: string },
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
    onEditEntityValue,
    onEditEntity,
    onDeleteEntities,
  } = props;
  const [showValue, setShowValue] = React.useState(false);
  const [showEntity, setShowEntity] = React.useState(false);
  const [entityItem, setEntityItem] = React.useState({ entity, entityValue });
  /**
   * @type {React.MutableRefObject<HTMLInputElement>}
   */
  const refValueInput = React.useRef();

  /**
   * @type {React.MutableRefObject<HTMLInputElement>}
   */
  const refEntityInput = React.useRef();

  // 透過ref控制input顯示後自動focus
  React.useEffect(() => {
    if (showValue) {
      refValueInput.current.focus();
    }
    if (showEntity) {
      refEntityInput.current.focus();
    }
  }, [showValue, showEntity]);

  // 意圖按鈕，點擊後顯示編輯輸入框
  const atShowClick = React.useCallback(
    (e) => {
      if (e.target.id === 'entityValue') {
        setShowValue((prev) => !prev);
      } else {
        setShowEntity((prev) => !prev);
      }
    },
    [setShowValue, setShowEntity],
  );

  // 關鍵字按鍵事件，按下enter後執行
  const atEntityValueKeyDown = React.useCallback(
    (e, stepIntent: string, oriEntityValue: string, newEntityValue: string) => {
      if (e.key === 'Enter' || e.type === 'blur') {
        if (oriEntityValue !== newEntityValue) {
          const isValid = userSay.includes(newEntityValue);
          const isRepeat = entities.some((item) => {
            if (item.value !== oriEntityValue) {
              if (
                (item.start <= userSay.indexOf(newEntityValue) &&
                  userSay.indexOf(newEntityValue) <= item.end - 1) ||
                (item.start <=
                  userSay.indexOf(newEntityValue) + newEntityValue.length &&
                  userSay.indexOf(newEntityValue) + newEntityValue.length <=
                    item.end)
              ) {
                return true;
              }
            }
            return false;
          });
          if (!isValid || isRepeat || newEntityValue === '') {
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
        setShowValue((prev) => !prev);
      }
    },
    [setShowValue, onEditEntityValue, userSay, entities],
  );

  // 關鍵字代表值按鍵事件，按下enter後執行
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
        <div className="px-2">
          <label htmlFor="entityValue" className={style.label}>
            關鍵字：
          </label>
          {showValue ? (
            <input
              type="text"
              id="entityValue"
              name="entityValue"
              defaultValue={entityItem.entityValue}
              ref={refValueInput}
              onChange={atChange}
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
              className="btn btn-outline-light"
              id="entityValue"
              onClick={atShowClick}
            >
              {entityItem.entityValue}
            </button>
          )}
        </div>
        <div className="px-2">
          <label htmlFor="entity" className={style.label}>
            代表值：
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
        className="btn btn-outline-danger"
        onClick={() => onDeleteEntities(entity, entityValue, intent)}
      >
        刪除關鍵字
      </button>
    </div>
  );
};

export default React.memo(Entities);
