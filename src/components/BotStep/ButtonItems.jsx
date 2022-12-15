import * as React from 'react';
import cx from 'classnames';
import style from './BotStep.module.scss';

type ButtonItemsProps = {
  title: string,
  payload: string,
  reply: string,
  disabled: boolean,
  buttonAction: string,
  checkPointName: string,
  connectBranchStoryName: string,
  onEditResButtons: (
    title: string,
    reply: string,
    buttonActionName: string,
    currentCheckPointName: string,
    currentConnectBranchStoryName: string,
  ) => void,
  onRemoveResButton: (
    title: string,
    payload: string,
    buttonActionName?: string,
    disabled?: boolean,
    currentCheckPointName: string,
    currentConnectBranchStoryName: string,
  ) => void,
};

const ButtonItems: React.FC<ButtonItemsProps> = (props) => {
  const {
    title,
    payload,
    reply,
    disabled,
    buttonAction,
    checkPointName,
    connectBranchStoryName,
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
    <div className="card col-12 mt-2">
      <div className="card-body">
        <h5 className="card-title d-flex justify-content-between">
          <p className={style.botlabel}>{title}</p>
          <div>
            <button
              className="btn btn-primary mx-1 "
              onClick={() =>
                onEditResButtons(
                  title,
                  reply,
                  buttonAction,
                  checkPointName,
                  connectBranchStoryName,
                )
              }
            >
              編輯
            </button>
            <button
              className="btn btn-danger"
              onClick={() =>
                onRemoveResButton(
                  title,
                  payload,
                  buttonAction,
                  disabled,
                  checkPointName,
                  connectBranchStoryName,
                )
              }
            >
              刪除
            </button>
          </div>
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
