/* eslint-disable no-unused-vars */
import * as React from 'react';
import cx from 'classnames';
import shallow from 'zustand/shallow';
import { RiCloseCircleFill } from 'react-icons/ri';
import style from './SlotValueItem.module.scss';
import type { State } from '../types';
import useStoryStore from '../../store/useStoryStore';

type SlotValueItemPropsType = {
  slotValue: { key: string, value: string },
};

const SlotValueItem: React.FC<SlotValueItemPropsType> = (props) => {
  const { slotValue } = props;

  // const { onCreateSlot } = useStoryStore((state: State) => {
  //   return {
  //     onCreateSlot: state.onCreateSlot,
  //   };
  // }, shallow);

  return (
    <span className={cx('badge text-bg-info m-2', style.item)}>
      {slotValue.value}
      <RiCloseCircleFill className={style.removeSlotValueIcon} />
    </span>
  );
};

export default React.memo(SlotValueItem);
