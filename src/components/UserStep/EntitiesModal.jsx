/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import cx from 'classnames';
import ReactDOM from 'react-dom';
import { AiOutlineClose } from 'react-icons/ai';
import { RiCloseCircleFill } from 'react-icons/ri';
import { Toast } from 'utils/swalInput';
import style from './EntitiesModal.module.scss';

type EntitiesModalProps = {
  title: string,
  isVisible: boolean,
  maxWidth: string,
  slots: { key: string, slotInfo: { type: string, values?: string[] } }[],
  contentEntity: {
    entity: string,
    value: string,
    start: number | null,
    end: number | null,
  }[],
  onClose: () => void,
  onSubmit: () => void,
  onSetContentEntity: () => void,
  onSetEntitiesArr: () => void,
};

const EntitiesModal: React.FC<EntitiesModalProps> = (props) => {
  const {
    title,
    isVisible,
    maxWidth,
    slots,
    // contentEntity,
    entitiesData,
    entitiesArr,
    onClose,
    // onSubmit,
    // onSetContentEntity,
    onSetEntitiesArr,
  } = props;

  console.log('entitiesData ==> ', entitiesData);

  /**
   * @type {[string[], Function]}
   */
  // const [synonyms, setSynonyms] = React.useState([]);

  /**
   * @type {[string, Function]}
   */
  const [synonymTextarea, setSynonymTextarea] = React.useState('');

  // textarea 自適應高度
  const textAreaRef = React.useRef();
  React.useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style = 'height: 0px';
      textAreaRef.current.value = synonymTextarea;
      textAreaRef.current.style = `height: ${
        textAreaRef.current.scrollHeight + 1
      }px`;
    }
  }, [synonymTextarea]);

  // 更新關鍵字資訊
  const atChangeEntitiesInfo = React.useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      id: string,
    ) => {
      // 獲取使用者輸入的資訊
      const { name, value } = e.target;

      // 更新故事名稱
      if (name === 'entity') {
        onSetEntitiesArr((prev) => {
          const newEntitiesArr = prev.map((item) => {
            if (item.id === id) {
              item[name] = value;
            }
            return item;
          });
          return newEntitiesArr;
        });
      }

      // 使用者選擇建立新類別
      if (name === 'entity' && value === 'createNewTag') {
        onSetEntitiesArr((prev) => {
          const newEntitiesArr = prev.map((item) => {
            if (item.id === id) {
              item.entity = '';
              item.create = true;
            }
            return item;
          });
          return newEntitiesArr;
        });
      }

      // 使用者選擇已建好的類別
      if (name === 'entity' && value !== 'createNewTag') {
        onSetEntitiesArr((prev) => {
          const newEntitiesArr = prev.map((item) => {
            if (item.id === id) {
              item[name] = value;
              item.create = false;
            }
            return item;
          });
          return newEntitiesArr;
        });
      }

      // 輸入新類別
      if (name === 'newTag') {
        // 驗證關鍵字代表值是否有數字
        const regex = /^[0-9]*$/;

        if (regex.test(value)) {
          Toast.fire({
            icon: 'warning',
            title: '標籤類別不能以數字開頭或純數字',
          });
          onSetEntitiesArr((prev) => {
            const newEntitiesArr = prev.map((item) => {
              if (item.id === id) {
                item.entity = '';
              }
              return item;
            });
            return newEntitiesArr;
          });
          return;
        }
        onSetEntitiesArr((prev) => {
          const newEntitiesArr = prev.map((item) => {
            if (item.id === id) {
              item.entity = value;
            }
            return item;
          });
          return newEntitiesArr;
        });
      }

      if (name === 'entityValue') {
        onSetEntitiesArr((prev) => {
          const newEntitiesArr = prev.map((item) => {
            if (item.id === id) {
              item.value = value;
            }
            return item;
          });
          return newEntitiesArr;
        });
      }
    },
    [onSetEntitiesArr],
  );

  // 新增同義字
  const atAddSynonyms = React.useCallback(
    (
      e:
        | React.KeyboardEvent<HTMLTextAreaElement>
        | React.MouseEvent<HTMLTextAreaElement>,
      id: string,
    ) => {
      if (e.keyCode === 13 || e.type === 'blur') {
        e.preventDefault();
        if (synonymTextarea.indexOf(',') > -1) {
          // 將同義字用「,」做切分
          let currentSynonyms = synonymTextarea.split(',');
          // 將同義字前後的空白去除
          currentSynonyms = currentSynonyms.map((item) =>
            item.trimStart().trimEnd(),
          );

          // 檢查新增的同義字中有沒有重複的值
          let isRepeat = currentSynonyms.filter(
            (item, idx, arr) => arr.indexOf(item) !== idx,
          );

          if (isRepeat.length) {
            Toast.fire({
              icon: 'warning',
              title: `不可新增相同的同義字`,
              text: isRepeat.toString(),
            });
            return;
          }

          // 檢查新增的同義字和原有的同義字是否重複
          // isRepeat = entitiesArr.synonyms
          //   .map((synonym) =>
          //     currentSynonyms.filter((newSynonym) => newSynonym === synonym),
          //   )
          //   .filter((repeat) => repeat.length);

          isRepeat = entitiesArr
            .filter((entityItem) => entityItem.id === id)[0]
            .synonyms.map((synonym) =>
              currentSynonyms.filter((newSynonym) => newSynonym === synonym),
            )
            .filter((repeat) => repeat.length);

          if (isRepeat.length) {
            Toast.fire({
              icon: 'warning',
              title: `同義字重複`,
              text: isRepeat.toString(),
            });
            return;
          }

          // 將新增的同義字新增進state中，不包含空值
          // setSynonyms((prev) =>
          //   prev.concat(currentSynonyms.filter((synonym) => synonym !== '')),
          // );
          console.log(
            "currentSynonyms.filter((synonym) => synonym !== '') ===> ",
            currentSynonyms.filter((synonym) => synonym !== ''),
          );
          onSetEntitiesArr((prev) => {
            const newEntitiesArr = prev.map((item) => {
              if (item.id === id) {
                item.synonyms = item.synonyms.concat(
                  currentSynonyms.filter((synonym) => synonym !== ''),
                );
              }
              return item;
            });
            return newEntitiesArr;
          });
        } else {
          // const isRepeat = entitiesArr.synonyms.filter(
          //   (item) => item === synonymTextarea,
          // );
          // if (isRepeat.length) {
          //   Toast.fire({
          //     icon: 'warning',
          //     title: `同義字重複`,
          //     text: isRepeat.toString(),
          //   });
          //   return;
          // }

          const isRepeat = entitiesArr
            .filter((entityItem) => entityItem.id === id)[0]
            .synonyms.filter((synonym) => synonym === synonymTextarea);

          if (isRepeat.length) {
            Toast.fire({
              icon: 'warning',
              title: `同義字重複`,
              text: isRepeat.toString(),
            });
            return;
          }

          if (synonymTextarea) {
            // setSynonyms((prev) => prev.concat([synonymTextarea]));

            onSetEntitiesArr((prev) => {
              const newEntitiesArr = prev.map((item) => {
                if (item.id === id) {
                  item.synonyms = item.synonyms.concat([synonymTextarea]);
                }
                return item;
              });
              return newEntitiesArr;
            });
          }
        }
        setSynonymTextarea('');
      }
    },
    [synonymTextarea, onSetEntitiesArr, entitiesArr],
  );

  // 移除同義字
  const atRemoveSynonym = React.useCallback(
    (synonym: string, id: string) => {
      // setSynonyms((prev) => prev.filter((item) => item !== synonym));
      onSetEntitiesArr((prev) => {
        const newEntitiesArr = prev.map((item) => {
          if (item.id === id) {
            item.synonyms = item.synonyms.filter(
              (synonymItem) => synonymItem !== synonym,
            );
          }
          return item;
        });
        return newEntitiesArr;
      });
    },
    [onSetEntitiesArr],
  );

  // 關閉modal
  const atClose = React.useCallback(() => {
    onClose();
    setSynonymTextarea('');
  }, [onClose, setSynonymTextarea]);

  // 點選back drop可以關閉視窗
  const modalRef = React.useRef(null);
  const atBackdropClick = (e) => {
    if (!modalRef.current.contains(e.target)) {
      atClose();
    }
  };

  return isVisible
    ? ReactDOM.createPortal(
        <div className={style.backdrop} onClick={atBackdropClick}>
          <div
            ref={modalRef}
            className={cx(style.modal, 'swal2-show')}
            style={
              maxWidth ? { maxWidth: `${maxWidth}%` } : { maxWidth: `${60}%` }
            }
          >
            <div className={cx(style.modalHeader)}>
              <h2 className={cx(style.modalTitle)}>{title}</h2>
              <AiOutlineClose
                className={cx(style.closeBtn)}
                onClick={() => atClose()}
              />
            </div>
            <div className={cx(style.hr)} />
            <div className={cx(style.modalContent)}>
              {entitiesArr.map((entityItem) => {
                return (
                  <div
                    key={entityItem.id}
                    className={cx(style.entityContainer)}
                  >
                    <div className="mb-3 mt-1">
                      <label htmlFor="entity" className="form-label">
                        標籤類別
                      </label>
                      <select
                        className="form-control"
                        name="entity"
                        id="entity"
                        value={
                          entityItem.create ? 'createNewTag' : entityItem.entity
                        }
                        onChange={(e) => atChangeEntitiesInfo(e, entityItem.id)}
                      >
                        <option value="" disabled hidden>
                          請選擇標籤類別
                        </option>
                        <option value="createNewTag">建立標籤類別</option>
                        {slots.map((slot) => (
                          <option
                            key={slot.key}
                            value={slot.key}
                            hidden={entitiesData.some(
                              (item) => item.entity === slot.key,
                            )}
                            disabled={entitiesData.some(
                              (item) => item.entity === slot.key,
                            )}
                          >
                            {slot.key}
                          </option>
                        ))}
                      </select>
                    </div>
                    {entityItem.create && (
                      <div className="mb-3 mt-1">
                        <input
                          type="text"
                          className="form-control"
                          id="newTag"
                          name="newTag"
                          value={entityItem.entity}
                          onChange={(e) =>
                            atChangeEntitiesInfo(e, entityItem.id)
                          }
                          placeholder="請輸入標籤類別名稱"
                        />
                      </div>
                    )}
                    <div className="mb-3 mt-1">
                      <label htmlFor="entityValue" className="form-label">
                        標籤
                      </label>
                      {entityItem.create ? (
                        <input
                          type="text"
                          className="form-control"
                          id="entityValue"
                          name="entityValue"
                          onChange={(e) =>
                            atChangeEntitiesInfo(e, entityItem.id)
                          }
                          placeholder="請輸入標籤名稱"
                        />
                      ) : (
                        <select
                          className="form-control"
                          name="entityValue"
                          id="entityValue"
                          value={entityItem.value}
                          disabled={!entityItem.entity}
                          onChange={(e) =>
                            atChangeEntitiesInfo(e, entityItem.id)
                          }
                        >
                          <option value="" hidden>
                            請選擇標籤
                          </option>
                          {slots
                            .filter((slot) => slot.key === entityItem.entity)[0]
                            ?.slotInfo.values.map((entityValue) => (
                              <option key={entityValue} value={entityValue}>
                                {entityValue}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                    <div className="mb-3 mt-1">
                      <label htmlFor="synonyms" className="form-label">
                        同義字
                      </label>
                      {entityItem.synonyms?.length > 0 && (
                        <div
                          className={cx(
                            'mb-3 mt-1 d-flex flex-wrap align-items-center',
                          )}
                        >
                          {entityItem.synonyms.map((synonym) => (
                            <span
                              key={synonym}
                              className={cx('m-2', style.item)}
                            >
                              {synonym}
                              <RiCloseCircleFill
                                className={style.removeSlotValueIcon}
                                onClick={() => atRemoveSynonym(synonym)}
                              />
                            </span>
                          ))}
                        </div>
                      )}
                      <textarea
                        className={cx(style.textarea)}
                        name="synonyms"
                        id="synonyms"
                        ref={textAreaRef}
                        rows="1"
                        placeholder="多個關鍵字請使用『,』分開，輸入完畢後請按下Enter鍵"
                        onKeyDown={(e) => atAddSynonyms(e, entityItem.id)}
                        onBlur={(e) => atAddSynonyms(e, entityItem.id)}
                        onChange={(e) => setSynonymTextarea(e.target.value)}
                        disabled={!entityItem.value}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={cx(style.modalFooter)}>
              <button
                className="btn btn-danger modalBtn"
                onClick={() => atClose()}
              >
                取消
              </button>
              <button
                className="btn btn-primary modalBtn"
                // onClick={() => onSubmit(modalData, !!inputPlaceholder)}
              >
                儲存
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;
};

export default React.memo(EntitiesModal);
