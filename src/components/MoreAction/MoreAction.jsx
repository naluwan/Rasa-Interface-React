/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import cx from 'classnames';
import style from './MoreAction.module.scss';
import deleteIcon from '../../images/delete_icon.png';
import editIcon from '../../images/edit_icon.png';

type MoreActionProps = {
  onSetShowMoreAction: () => void,
  onDeleteStory: () => void,
};

const MoreAction: React.FC<MoreActionProps> = (props) => {
  const { onSetShowMoreAction, onDeleteStory } = props;

  return (
    <div className={style.root}>
      <button
        className={cx(style.editIcon)}
        onClick={() => {
          onSetShowMoreAction(false);
        }}
      >
        <img src={editIcon} alt="edit_icon" />
      </button>
      |
      <button
        className={cx(style.deleteIcon)}
        onClick={() => {
          onSetShowMoreAction(false);
          onDeleteStory();
        }}
      >
        <img src={deleteIcon} alt="delete_icon" />
      </button>
    </div>
  );
};

export default React.memo(MoreAction);
