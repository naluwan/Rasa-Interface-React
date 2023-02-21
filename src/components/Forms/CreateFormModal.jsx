/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import cx from 'classnames';
import ReactDOM from 'react-dom';
import { AiOutlineClose } from 'react-icons/ai';
import style from './CreateFromModal.module.scss';

type CreateFromModalProps = {
  title: string,
  inputPlaceholder: string,
  textAreaPlaceholder: string,
  isVisible: boolean,
  maxWidth: string,
  modalTextarea: string,
  onClose: () => void,
  onSubmit: () => void,
};

const CreateFromModal: React.FC<CreateFromModalProps> = (props) => {
  const { title, isVisible, maxWidth, modalTextarea, onClose, onSubmit } =
    props;

  const [modalData, setModalData] = React.useState({
    name: '',
    request_slot: {},
  });

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
    setModalData({ name: '', request_slot: {} });
  }, [onClose, setModalData]);

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
              <div className={cx('mb-3 mt-1')}>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  id="name"
                  value={modalData.modalInput}
                  placeholder="請輸入表單名稱"
                  onChange={(e) => atChange(e)}
                />
              </div>

              <div className={cx('mb-3 mt-1')}>
                <input
                  type="text"
                  className="form-control"
                  name="request_slot"
                  id="request_slot"
                  value={modalData.modalInput}
                  placeholder="請輸入要收集的表單問題"
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
                onClick={() => atSubmit(modalData)}
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

export default React.memo(CreateFromModal);
