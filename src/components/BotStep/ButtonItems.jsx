import * as React from 'react';
import cx from 'classnames';
import style from './BotStep.module.scss';

type ButtonItemsProps = {
  title: string,
  payload: string,
  reply: string,
  disabled: boolean,
  buttonAction: string,
  onEditResButtons: (title: string, reply: string) => void,
  onRemoveResButton: (title: string, payload: string) => void,
};

const ButtonItems: React.FC<ButtonItemsProps> = (props) => {
  const {
    title,
    payload,
    reply,
    disabled,
    buttonAction,
    onEditResButtons,
    onRemoveResButton,
  } = props;

  // textarea 自適應高度
  const buttonTextareaRef = React.useRef();
  React.useEffect(() => {
    buttonTextareaRef.current.style = 'height:0px';
    buttonTextareaRef.current.value = reply;
    buttonTextareaRef.current.style = `height: ${buttonTextareaRef.current.scrollHeight}px`;
  }, [reply]);

  return (
    <div className="card col-10 m-3" key={payload}>
      <div className="card-body">
        <h5 className="card-title d-flex justify-content-between">
          <button
            className="btn btn-primary"
            onClick={() => onEditResButtons(title, reply, buttonAction)}
            disabled={disabled}
          >
            {title}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onRemoveResButton(title, payload)}
          >
            刪除
          </button>
        </h5>
        <textarea
          className={cx('card-text col-12', style.botResponse)}
          ref={buttonTextareaRef}
          rows={1}
          readOnly
        />
      </div>
    </div>
  );
};

export default React.memo(ButtonItems);
