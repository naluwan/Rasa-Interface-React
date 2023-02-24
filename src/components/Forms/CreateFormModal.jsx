/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import cx from 'classnames';
import ReactDOM from 'react-dom';
import { AiOutlineClose } from 'react-icons/ai';
import uuid from 'react-uuid';
import { CgAddR } from 'react-icons/cg';
import { BsTrashFill } from 'react-icons/bs';
import shallow from 'zustand/shallow';
import type { State } from 'components/types';
import { Toast } from 'utils/swalInput';
import style from './CreateFromModal.module.scss';
import useStoryStore from '../../store/useStoryStore';

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
  const { title, isVisible, maxWidth, allForms, onClose } = props;

  const [modalData, setModalData] = React.useState({
    name: '',
    request_slot: [{ id: uuid(), question: '' }],
  });

  const { onCreateForm } = useStoryStore((state: State) => {
    return {
      onCreateForm: state.onCreateForm,
    };
  }, shallow);

  // 更新modal input, textarea的值
  const atChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, id?: string) => {
      const { name, value } = e.target;
      if (name === 'request_slot') {
        return setModalData((prev) => {
          return {
            ...prev,
            request_slot: prev.request_slot.map((slot) => {
              if (slot.id === id) {
                slot.question = value;
              }
              return slot;
            }),
          };
        });
      }
      return setModalData((prev) => {
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
    setModalData({
      name: '',
      request_slot: [{ id: uuid(), question: '' }],
    });
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
    (currentData) => {
      const { name, request_slot } = currentData;

      const isRepeat = allForms.some((form) => form[0] === name);

      if (isRepeat) {
        Toast.fire({
          icon: 'warning',
          title: '表單名稱重複',
        });
        return;
      }

      const isNull = request_slot.some((slot) => slot.question === '');

      if (isNull) {
        Toast.fire({
          icon: 'warning',
          title: '表單問題是必填的',
        });
        return;
      }

      onCreateForm(name, request_slot);
      atCloseModal();
    },
    [atCloseModal, onCreateForm, allForms],
  );

  // 新增表單問答輸入框
  const addSlot = React.useCallback(() => {
    setModalData((prev) => {
      const newRequestSlot = prev.request_slot.concat([
        { id: uuid(), question: '' },
      ]);
      return {
        ...prev,
        request_slot: newRequestSlot,
      };
    });
  }, []);

  // 移除表單問答輸入框
  const removeSlot = React.useCallback((id: string) => {
    setModalData((prev) => {
      return {
        ...prev,
        request_slot:
          prev.request_slot.length === 1
            ? prev.request_slot
            : prev.request_slot.filter((slot) => slot.id !== id),
      };
    });
  }, []);

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

              {modalData.request_slot.length > 0 &&
                modalData.request_slot.map((slot, idx) => {
                  return (
                    <div key={slot.id} className={cx(style.inputContainer)}>
                      <div className={cx('mb-3 mt-1 col-11')}>
                        <input
                          type="text"
                          className="form-control"
                          name="request_slot"
                          id="request_slot"
                          value={slot.question}
                          placeholder={`請輸入第${idx + 1}個的表單問題`}
                          onChange={(e) => atChange(e, slot.id)}
                        />
                      </div>
                      <div
                        className={cx(
                          'mb-3 mt-1 col-1',
                          style.trashIconContainer,
                        )}
                      >
                        <BsTrashFill onClick={() => removeSlot(slot.id)} />
                      </div>
                    </div>
                  );
                })}
              <div className={cx('mb-3 mt-1 d-flex justify-content-center')}>
                <CgAddR className={cx(style.add)} onClick={() => addSlot()} />
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
