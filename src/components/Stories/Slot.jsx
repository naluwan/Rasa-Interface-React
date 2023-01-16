import * as React from 'react';
// import { BiDotsVerticalRounded } from 'react-icons/bi';
import cx from 'classnames';
import shallow from 'zustand/shallow';
import style from './Slot.module.scss';
import type { State } from '../types';
import useStoryStore from '../../store/useStoryStore';
import SlotValueItem from './SlotValueItem';
import { confirmWidget } from '../../utils/swalInput';

type SlotPropsType = {
  slot: { key: string, slotInfo: { type: string, values?: string[] } },
  onClickAddSlotValuesBtn: (slotName: string) => void,
};

const Slot: React.FC<SlotPropsType> = (props) => {
  const { slot, onClickAddSlotValuesBtn } = props;

  const { onRemoveSlot } = useStoryStore((state: State) => {
    return {
      onRemoveSlot: state.onRemoveSlot,
    };
  }, shallow);

  // 移除指定記錄槽
  const atRemoveSlot = React.useCallback(
    (slotName: string) => {
      confirmWidget(slotName, 'delete').then((result) => {
        if (!result.isConfirmed) return;
        onRemoveSlot(slotName);
      });
    },
    [onRemoveSlot],
  );

  return (
    <ul
      key={slot.key}
      className={cx('mb-2 flex-column ', style.slotContainer, style.slot)}
    >
      <div className={style.title}>{slot.key}</div>
      <hr />
      <div className={cx(style.SlotValueItemBlock)}>
        <label htmlFor={slot.key} className={cx(style.labelBlock)}>
          {slot.slotInfo.values.map((value) => {
            return (
              <SlotValueItem
                key={`slotValueItem-${value}`}
                slotValue={{ key: slot.key, value }}
              />
            );
          })}
          <textarea
            className={cx(style.setTextarea)}
            id={slot.key}
            name={slot.key}
            type="text"
          />
        </label>
      </div>
      <div className={cx('dropdown  mt-3', style.dropdownMenu)}>
        <button className="btn" type="button" data-bs-toggle="dropdown">
          {/* <BiDotsVerticalRounded />
          123 */}
        </button>
        <ul className="dropdown-menu">
          {slot.slotInfo.type === 'categorical' && (
            <li>
              <button
                className="dropdown-item edit"
                data-bs-toggle="modal"
                data-bs-target="#addSlotValueModal"
                onClick={() => onClickAddSlotValuesBtn(slot.key)}
              >
                新增儲存槽值
              </button>
            </li>
          )}
          <li>
            <button
              className="dropdown-item delete"
              onClick={() => atRemoveSlot(slot.key)}
            >
              刪除
            </button>
          </li>
        </ul>
      </div>
    </ul>
  );
};

export default React.memo(Slot);
