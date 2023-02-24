/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import cx from 'classnames';
import ReactDOM from 'react-dom';
import { AiOutlineClose } from 'react-icons/ai';
import style from './Modal.module.scss';

type ModalProps = {
  title: string,
  inputPlaceholder: string,
  textAreaPlaceholder: string,
  isVisible: boolean,
  maxWidth: string,
  modalTextarea: string,
  onClose: () => void,
  onSubmit: () => void,
};

const Modal: React.FC<ModalProps> = (props) => {
  const {
    title,
    inputPlaceholder,
    textAreaPlaceholder,
    isVisible,
    maxWidth,
    modalTextarea,
    onClose,
    onSubmit,
  } = props;

  const [modalData, setModalData] = React.useState({
    modalInput: '',
    modalTextarea: '',
  });

  // 當父層有傳textarea值進來時要將值設為textarea的預設值
  React.useEffect(() => {
    setModalData((prev) => {
      return {
        ...prev,
        modalTextarea,
      };
    });
  }, [modalTextarea]);

  // 更新modal input, textarea的值
  const atChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setModalData((prev) => {
        return {
          ...prev,
          [name]: value,
        };
      });
    },
    [],
  );

  // 關閉視窗時會重置新增按鈕的modal data
  const atCloseModal = React.useCallback(() => {
    onClose();
    if (inputPlaceholder) {
      setModalData({ modalInput: '', modalTextarea: '' });
    }
  }, [onClose, setModalData, inputPlaceholder]);

  // 點選back drop可以關閉視窗
  const modalRef = React.useRef(null);
  const atBackdropClick = (e) => {
    if (!modalRef.current.contains(e.target)) {
      atCloseModal();
    }
  };

  // 送出填入的資料，送出後關閉彈跳窗
  const atSubmit = React.useCallback(
    (
      currentData: {
        modalInput: string,
        modalTextarea: string,
      },
      hasInput: boolean,
    ) => {
      if (!hasInput && !currentData.modalTextarea) {
        setModalData((prev) => {
          return {
            ...prev,
            modalTextarea,
          };
        });
      }
      onSubmit(currentData, hasInput);
      atCloseModal();
    },
    [onSubmit, atCloseModal, modalTextarea],
  );

  return isVisible
    ? ReactDOM.createPortal(
        <div className={style.backdrop} onMouseDown={atBackdropClick}>
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
                onClick={() => atCloseModal()}
              />
            </div>
            <div className={cx(style.hr)} />
            <div className={cx(style.modalContent)}>
              {inputPlaceholder ? (
                <div className={cx('mb-3 mt-1')}>
                  <input
                    type="text"
                    className="form-control"
                    name="modalInput"
                    id="modalInput"
                    value={modalData.modalInput}
                    placeholder={inputPlaceholder}
                    onChange={(e) => atChange(e)}
                  />
                </div>
              ) : null}
              <div className={cx('mb-3 mt-1')}>
                <textarea
                  className="form-control"
                  name="modalTextarea"
                  id="modalTextarea"
                  rows="5"
                  placeholder={textAreaPlaceholder}
                  value={modalData.modalTextarea}
                  onChange={(e) => atChange(e)}
                />
              </div>
            </div>
            <div className={cx(style.modalFooter)}>
              <button
                className="btn btn-danger modalBtn"
                onClick={() => atCloseModal()}
              >
                取消
              </button>
              <button
                className="btn btn-primary modalBtn"
                onClick={() => atSubmit(modalData, !!inputPlaceholder)}
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

export default React.memo(Modal);
