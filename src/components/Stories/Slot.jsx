/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-unused-vars */
import * as React from 'react';
// import { BiDotsVerticalRounded } from 'react-icons/bi';
import cx from 'classnames';
import shallow from 'zustand/shallow';
import { check } from 'prettier';
import uuid from 'react-uuid';
import style from './Slot.module.scss';
import useStoryStore from '../../store/useStoryStore';
import SlotValueItem from './SlotValueItem';
import type { DomainType, State } from '../types';
import { confirmWidget } from '../../utils/swalInput';

type SlotPropsType = {
  slot: { key: string, slotInfo: { type: string, values?: string[] } },
  onClickAddSlotValuesBtn: (slotName: string) => void,
  atChangeNewSlotValues: (
    e: React.ChangeEvent<HTMLInputElement>,
    targetId: string,
  ) => void,
  atSubmitSlotValues: (
    slotValues: {
      slotName: string,
      slotValueItems: { name: string, id: string }[],
    },
    domainData: DomainType,
  ) => void,
  domain: DomainType,
};

const Slot: React.FC<SlotPropsType> = (props) => {
  const {
    slot,
    onClickAddSlotValuesBtn,
    atChangeNewSlotValues,
    atSubmitSlotValues,
    domain,
  } = props;
  console.log(slot);
  const { onRemoveSlot } = useStoryStore((state: State) => {
    return {
      onRemoveSlot: state.onRemoveSlot,
    };
  }, shallow);
  const [newSlotValues] = React.useState({
    slotName: '',
    slotValueItems: [{ name: '', id: uuid() }],
  });
  // 打開隱藏的ul
  const openSlotValueItemBlock = (id) => {
    const element = document.querySelector(`#${id}`);
    const allUl = document.querySelectorAll('[name=stateMentLibrary] ul');
    if (element.getAttribute('data-open') === 'open') {
      allUl.forEach((e) => {
        e.setAttribute('data-open', 'none');
      });
    } else {
      allUl.forEach((e) => {
        e.setAttribute('data-open', 'none');
      });
      element.setAttribute('data-open', 'open');
    }
  };
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
  const [formData, setFormData] = React.useState({});
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    newSlotValues.slotName = e.target.name;
    newSlotValues.slotValueItems[0].name = e.target.value;
    atChangeNewSlotValues(e, e.target.name);
  };
  // 轉化為標籤
  const handleSubmit = (e) => {
    console.log(formData);
    atSubmitSlotValues(newSlotValues, domain);
    newSlotValues.slotName = '';
    newSlotValues.slotValueItems[0].name = '';
    e.preventDefault();
  };

  return (
    <ul
      id={`title${slot.key}`}
      data-open="none"
      key={slot.key}
      className={cx('mb-2 flex-column ', style.slotContainer, style.slot)}
    >
      <div
        className={style.title}
        onClick={() => {
          openSlotValueItemBlock(`title${slot.key}`);
        }}
      >
        {slot.key}
      </div>
      <hr />
      <div name="SlotValueItemBlock" className={cx(style.SlotValueItemBlock)}>
        <form
          action="#"
          method="get"
          onSubmit={(e) => {
            handleSubmit(e);
          }}
        >
          <label htmlFor={slot.key} className={cx(style.labelBlock)}>
            {slot.slotInfo.values?.map((value) => {
              return (
                <SlotValueItem
                  key={`slotValueItem-${value}`}
                  slotValue={{ key: slot.key, value }}
                />
              );
            })}
            <input
              className={cx(style.setInput)}
              id={slot.key}
              onChange={handleChange}
              placeholder={`請輸入${slot.key}標籤名稱`}
              value={newSlotValues.slotValueItems[0].name}
              name={slot.key}
              type="text"
            />
          </label>
          <input className={cx(style.slotSubmit)} type="submit" value="送出" />
        </form>
      </div>

      {/* <div className={cx('dropdown  mt-3', style.dropdownMenu)}>
        <button className="btn" type="button" data-bs-toggle="dropdown">
          <BiDotsVerticalRounded />
          123
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
      </div> */}
    </ul>
  );
};

export default React.memo(Slot);
