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

  const { onRemoveSlotValue } = useStoryStore((state: State) => {
    return {
      onRemoveSlotValue: state.onRemoveSlotValue,
    };
  }, shallow);

  return (
    <div className={cx(' m-2', style.item)}>
      {slotValue.value}
      <RiCloseCircleFill
        className={style.removeSlotValueIcon}
        onClick={() => onRemoveSlotValue(slotValue)}
      />
    </div>
  );
};

export default React.memo(SlotValueItem);
