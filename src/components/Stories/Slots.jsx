import * as React from 'react';
import { CgAddR } from 'react-icons/cg';
import cx from 'classnames';
import uuid from 'react-uuid';
import { Toast } from 'utils/swalInput';
import { BsTrashFill } from 'react-icons/bs';
import shallow from 'zustand/shallow';
import style from './Slots.module.scss';
import type { DomainType, State } from '../types';
import useStoryStore from '../../store/useStoryStore';
import Slot from './Slot';

type SlotsPropsType = {
  slots: { key: string, slotInfo: { type: string, values?: string[] } }[],
  domain: DomainType,
};

const Slots: React.FC<SlotsPropsType> = (props) => {
  const { slots, domain } = props;
  /**
   * @type {[{slotName:string,slotType:string,slotValues:{name:string,id:string}[]}, Function]}
   */
  const [formValue, setFormValue] = React.useState({
    slotName: '',
    slotType: '',
    slotValues: [],
  });
  /**
   * @type {[slotValues:{ slotName: string, slotValueItems: { name: string, id: string}[] }, Function]}
   */
  // eslint-disable-next-line no-unused-vars
  const [newSlotValues, setNewSlotValues] = React.useState({
    slotName: '',
    slotValueItems: [{ name: '', id: uuid() }],
  });

  const { onCreateSlot, onAddSlotValue } = useStoryStore((state: State) => {
    return {
      onCreateSlot: state.onCreateSlot,
      onAddSlotValue: state.onAddSlotValue,
    };
  }, shallow);

  // 新增記錄槽輸入框事件，輸入後會將值寫進formValue中
  const atChangeFormValue = React.useCallback(
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLSelectElement>,
      targetId: string,
    ) => {
      const { name, value } = e.target;
      if (name === 'slotType' && value === 'categorical') {
        return setFormValue((prev) => {
          const id = uuid();
          return {
            ...prev,
            [name]: value,
            slotValues: prev.slotValues.concat([{ name: '', id }]),
          };
        });
      }
      if (name === 'slotType' && value === 'text') {
        return setFormValue((prev) => {
          return {
            ...prev,
            [name]: value,
            slotValues: [],
          };
        });
      }
      if (name === 'name') {
        return setFormValue((prev) => {
          return {
            ...prev,
            slotValues: prev.slotValues.map((slotValue) => {
              if (slotValue.id === targetId) {
                slotValue.name = value;
              }
              return slotValue;
            }),
          };
        });
      }
      return setFormValue((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    },
    [setFormValue],
  );

  // 新增儲存槽名稱的輸入框
  const atAddSlotInput = React.useCallback(() => {
    setFormValue((prev) => {
      const id = uuid();
      return {
        ...prev,
        slotValues: prev.slotValues.concat([{ name: '', id }]),
      };
    });
  }, [setFormValue]);

  // 取消新增記錄槽時，將formValue的值都清空
  const atCancelAddSlot = React.useCallback(() => {
    setFormValue({
      slotName: '',
      slotType: '',
      slotValues: [],
    });
  }, [setFormValue]);

  // 刪除儲存槽名稱的輸入框
  const atRemoveSlotInput = React.useCallback(
    (id: string) => {
      setFormValue((prev) => {
        let { slotValues } = prev;
        if (prev.slotValues.length > 1) {
          // 如果儲存槽數量大於1，刪除要刪除的input
          slotValues = prev.slotValues.filter((item) => item.id !== id);
        } else {
          // 如果儲存槽數量只剩1，就不刪除input，只將值設為空
          slotValues[0].name = '';
        }
        return {
          ...prev,
          slotValues,
        };
      });
    },
    [setFormValue],
  );

  // 驗證記憶槽資訊是否有填寫完全和正確，儲存記憶槽資訊
  const atSubmitFormValue = React.useCallback(
    (
      slotValue: {
        slotName: string,
        slotType: string,
        slotValues: { name: string, id: string }[],
      },
      domainData: DomainType,
    ) => {
      // 都沒填值案儲存，就關閉新增視窗
      if (slotValue.slotName === '' && slotValue.slotType === '') {
        document.querySelector('#addSlotModal .modal-header button').click();
        return;
      }

      // 驗證必填欄位是否都有填
      if (slotValue.slotName === '' || slotValue.slotType === '') {
        Toast.fire({
          icon: 'warning',
          title: '所有欄位都是必填的',
        });
        return;
      }

      // 驗證記錄槽名稱是否重複
      const isRepeat = Object.keys(domainData.slots).some(
        (slotName) => slotName === slotValue.slotName,
      );
      if (isRepeat) {
        Toast.fire({
          icon: 'warning',
          title: '記錄槽名稱重複',
        });
        return;
      }

      // 驗證slotType為categorical時，slotValues是否有正確的值
      if (
        slotValue.slotName !== '' &&
        slotValue.slotType === 'categorical' &&
        slotValue.slotValues.length
      ) {
        const emptySlots = [];
        const repeatArray = [];
        // 驗證空值和重複
        slotValue.slotValues.map((item) => {
          // 儲存時如果值為空
          if (item.name === '') {
            emptySlots.push(item);
          }
          return item;
        });

        // 如果儲存時為空值，就將此input刪除
        if (emptySlots.length) {
          // 因為是用傳參數的方式將值傳進來，所以需要在裡面直接改變值，改useState的無法改變傳去後端的參數
          slotValue.slotValues = slotValue.slotValues.filter((item) =>
            slotValue.slotValues.length > 1 ? item.name !== '' : item,
          );
          setFormValue((prev) => {
            return {
              ...prev,
              slotValues: prev.slotValues.filter((item) =>
                prev.slotValues.length > 1 ? item.name !== '' : item,
              ),
            };
          });
        }

        // 如果空值刪除完，沒有儲存槽值的處理
        if (
          slotValue.slotValues.length === 1 &&
          slotValue.slotValues[0].name === ''
        ) {
          Toast.fire({
            icon: 'warning',
            title: '儲存槽值最少需要填寫一個',
          });
          return;
        }

        slotValue.slotValues.map((item) => {
          // 比對重複
          slotValue.slotValues.map((checkItem) => {
            if (
              item.id !== checkItem.id &&
              checkItem.name === item.name &&
              item.name !== '' &&
              checkItem.name !== ''
            ) {
              if (!repeatArray.length) {
                repeatArray.push(checkItem);
              } else {
                // 驗證此重複是不是已添加過
                const isExist = repeatArray.some(
                  (repeatItem) => repeatItem.name === checkItem.name,
                );
                if (!isExist) {
                  repeatArray.push(checkItem);
                }
              }
            }
            return checkItem;
          });
          return item;
        });

        // 儲存槽名稱重複的處理
        if (repeatArray.length) {
          setFormValue((prev) => {
            const slotValues = prev.slotValues.map((item) => {
              return repeatArray.map((checkItem) => {
                if (item.id === checkItem.id) {
                  item.name = '';
                }
                return item;
              })[0];
            });
            return {
              ...prev,
              slotValues,
            };
          });
          Toast.fire({
            icon: 'warning',
            title: '同一個記錄槽內不能有重複的儲存槽名稱',
          });
          return;
        }
      }

      console.log('final slotValue:', slotValue);
      // 將資料送進store並操作資料庫
      onCreateSlot(slotValue);
      // 關閉新增視窗
      document.querySelector('#addSlotModal .modal-header button').click();
    },
    [onCreateSlot],
  );

  // 設定要新增儲存槽的記錄槽名稱
  const atClickAddSlotValuesBtn = React.useCallback(
    (slotName: string) => {
      setNewSlotValues((prev) => {
        return {
          ...prev,
          slotName,
        };
      });
    },
    [setNewSlotValues],
  );

  // 更新newSlotValues的值
  const atChangeNewSlotValues = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, targetId: string) => {
      const { value } = e.target;
      setNewSlotValues((prev) => {
        const slotValueItems = prev.slotValueItems.map((item) => {
          if (item.id === targetId) {
            item.name = value;
          }
          return item;
        });
        return {
          ...prev,
          slotValueItems,
        };
      });
    },
    [setNewSlotValues],
  );

  // 刪除儲存槽裡的輸入框
  const atRemoveNewSlotInput = React.useCallback(
    (targetId: string) => {
      setNewSlotValues((prev) => {
        let { slotValueItems } = prev;
        if (prev.slotValueItems.length > 1) {
          slotValueItems = prev.slotValueItems.filter(
            (item) => item.id !== targetId,
          );
        } else {
          slotValueItems[0].name = '';
        }
        return {
          ...prev,
          slotValueItems,
        };
      });
    },
    [setNewSlotValues],
  );

  // 新增儲存槽裡的輸入框
  const atAddSlotValuesInput = React.useCallback(() => {
    setNewSlotValues((prev) => {
      const id = uuid();
      return {
        ...prev,
        slotValueItems: prev.slotValueItems.concat([{ name: '', id }]),
      };
    });
  }, [setNewSlotValues]);

  // 取消新增儲存槽時，將newSlotValues的值重置
  const atCancelAddSlotValues = React.useCallback(() => {
    setNewSlotValues({
      slotName: '',
      slotValueItems: [{ name: '', id: uuid() }],
    });
  }, [setNewSlotValues]);

  // 驗證輸入框的值是否正確或重複，送出儲存槽資料至資料庫
  const atSubmitSlotValues = React.useCallback(
    (
      slotValues: {
        slotName: string,
        slotValueItems: { name: string, id: string }[],
      },
      domainData: DomainType,
    ) => {
      const repeatArr = [];
      const emptyArr = [];

      domainData.slots[slotValues.slotName].values.map((item) => {
        return slotValues.slotValueItems.map((checkItem) => {
          if (item === checkItem.name) {
            repeatArr.push(checkItem);
          }
          return checkItem;
        });
      });

      if (repeatArr.length) {
        setNewSlotValues((prev) => {
          const slotValueItems = prev.slotValueItems.map((item) => {
            return repeatArr.map((checkItem) => {
              if (item.id === checkItem.id) {
                item.name = '';
              }
              return item;
            })[0];
          });
          return {
            ...prev,
            slotValueItems,
          };
        });
        Toast.fire({
          icon: 'warning',
          title: '同一個記錄槽內不能有重複的儲存槽名稱',
        });
        return;
      }

      // 驗證是否有空值
      slotValues.slotValueItems.map((item) => {
        if (item.name === '') {
          emptyArr.push(item);
        }
        return item;
      });

      // 如果儲存時為空值，就將此input刪除
      if (emptyArr.length) {
        const isAllEmpty = slotValues.slotValueItems.every(
          (item) => item.name === '',
        );

        // 全部都為空值
        if (isAllEmpty) {
          // 重置儲存槽值
          const id = uuid();
          slotValues.slotValueItems = [{ name: '', id }];
          setNewSlotValues((prev) => {
            return {
              ...prev,
              slotValueItems: [{ name: '', id }],
            };
          });
        } else {
          // 部分不為空值就將空值全部篩選掉
          slotValues.slotValueItems = slotValues.slotValueItems.filter((item) =>
            slotValues.slotValueItems.length > 1 ? item.name !== '' : item,
          );
          setNewSlotValues((prev) => {
            return {
              ...prev,
              slotValueItems: prev.slotValueItems.filter((item) =>
                prev.slotValueItems.length > 1 ? item.name !== '' : item,
              ),
            };
          });
        }
      }

      // 如果空值刪除完，沒有儲存槽值的處理
      if (
        slotValues.slotValueItems.length === 1 &&
        slotValues.slotValueItems[0].name === ''
      ) {
        Toast.fire({
          icon: 'warning',
          title: '儲存槽值最少需要填寫一個',
        });
      }

      // 驗證重複
      slotValues.slotValueItems.map((item) => {
        slotValues.slotValueItems.map((checkItem) => {
          if (
            item.id !== checkItem.id &&
            item.name === checkItem.name &&
            item.name !== '' &&
            checkItem.name !== ''
          ) {
            if (!repeatArr.length) {
              repeatArr.push(checkItem);
            } else {
              const isExist = repeatArr.some(
                (repeatItem) => repeatItem.name === checkItem.name,
              );

              if (!isExist) {
                repeatArr.push(checkItem);
              }
            }
          }
          return checkItem;
        });
        return item;
      });

      // 重複的處理方式
      if (repeatArr.length) {
        setNewSlotValues((prev) => {
          const slotValueItems = prev.slotValueItems.map((item) => {
            return repeatArr.map((checkItem) => {
              if (item.id === checkItem.id) {
                item.name = '';
              }
              return item;
            })[0];
          });
          return {
            ...prev,
            slotValueItems,
          };
        });
        Toast.fire({
          icon: 'warning',
          title: '同一個記錄槽內不能有重複的儲存槽名稱',
        });
      }

      onAddSlotValue(slotValues);
    },
    [setNewSlotValues, onAddSlotValue],
  );

  return (
    <div className="offcanvas-body">
      {slots.map((slot) => {
        const { key, slotInfo } = slot;
        return (
          <Slot
            key={`slot-${key}`}
            slot={{ key, slotInfo }}
            onClickAddSlotValuesBtn={atClickAddSlotValuesBtn}
          />
        );
      })}
      <CgAddR
        className={cx(style.add)}
        data-bs-toggle="modal"
        data-bs-target="#addSlotModal"
      />
      {/* 新增記錄槽 modal */}
      <div
        className="modal fade"
        id="addSlotModal"
        data-bs-backdrop="false"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="addSlotModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addSlotModalLabel">
                新增記錄槽
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => atCancelAddSlot()}
              />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="slotName"
                  placeholder="請輸入記錄槽名稱"
                  name="slotName"
                  value={formValue.slotName}
                  onChange={(e) => atChangeFormValue(e)}
                />
              </div>
              <div className="mb-3">
                <select
                  className="form-control"
                  id="slotType"
                  value={formValue.slotType}
                  name="slotType"
                  onChange={(e) => atChangeFormValue(e)}
                >
                  <option value="" hidden disabled>
                    請選擇記錄槽種類
                  </option>
                  <option value="text">文字</option>
                  <option value="categorical">儲存槽</option>
                </select>
              </div>
              {formValue.slotValues.length > 0 && (
                <div>
                  <div className="mb-2">儲存槽值</div>
                  {formValue.slotValues.map((slotValue) => {
                    return (
                      <div
                        className="mb-3 d-flex align-items-center"
                        key={slotValue.id}
                      >
                        <input
                          type="text"
                          className="form-control"
                          id="slotName"
                          placeholder="請輸入儲存槽名稱"
                          name="name"
                          value={slotValue.name}
                          onChange={(e) => atChangeFormValue(e, slotValue.id)}
                        />
                        <BsTrashFill
                          className={style.removeSlotInput}
                          onClick={() => atRemoveSlotInput(slotValue.id)}
                        />
                      </div>
                    );
                  })}
                  <CgAddR
                    className={cx(style.addSlotInput)}
                    onClick={() => atAddSlotInput()}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => atCancelAddSlot()}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => atSubmitFormValue(formValue, domain)}
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 新增儲存槽 modal */}
      <div
        className="modal fade"
        id="addSlotValueModal"
        data-bs-backdrop="false"
        data-bs-keyboard="false"
        tabIndex="-1"
        aria-labelledby="addSlotValueModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addSlotValueModalLabel">
                新增「{newSlotValues.slotName}」的儲存槽值
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => atCancelAddSlotValues()}
              />
            </div>
            <div className="modal-body">
              {newSlotValues.slotValueItems.map((slotValue) => {
                return (
                  <div
                    className="mb-3 d-flex align-items-center"
                    key={slotValue.id}
                  >
                    <input
                      type="text"
                      className="form-control"
                      id="slotName"
                      placeholder="請輸入儲存槽名稱"
                      name="name"
                      value={slotValue.name}
                      onChange={(e) => atChangeNewSlotValues(e, slotValue.id)}
                    />
                    <BsTrashFill
                      className={style.removeSlotInput}
                      onClick={() => atRemoveNewSlotInput(slotValue.id)}
                    />
                  </div>
                );
              })}
              <CgAddR
                className={cx(style.addSlotInput)}
                onClick={() => atAddSlotValuesInput()}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => atCancelAddSlotValues()}
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => atSubmitSlotValues(newSlotValues, domain)}
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Slots);
