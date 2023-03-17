/* eslint-disable jsx-a11y/no-static-element-interactions */
import * as React from 'react';
import cx from 'classnames';
import ReactDOM from 'react-dom';
import { AiOutlineClose } from 'react-icons/ai';
import style from './EditStoryModal.module.scss';
import type { Categories } from '../../services/api';
import type { StoryType } from '../types';

type EditStoryModalProps = {
  title: string,
  isVisible: boolean,
  maxWidth: string,
  storyInfo: {
    ori: { story: string, category: string },
    new: { story: string, category: string, create?: boolean },
  },
  categories: Categories[],
  stories: StoryType[],
  onChangeStoryInfo: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void,
  onClose: () => void,
  onSubmit: (
    storyInfoData: EditStoryModalProps.storyInfo,
    storiesData: EditStoryModalProps.stories,
    categoriesData: EditStoryModalProps.categories,
  ) => void,
};

const EditStoryModal: React.FC<EditStoryModalProps> = (props) => {
  const {
    title,
    isVisible,
    maxWidth,
    storyInfo,
    onChangeStoryInfo,
    onClose,
    categories,
    stories,
    onSubmit,
  } = props;

  // const [modalData, setModalData] = React.useState({
  //   modalInput: '',
  //   modalTextarea: '',
  // });

  // 當父層有傳textarea值進來時要將值設為textarea的預設值
  // React.useEffect(() => {
  //   setModalData((prev) => {
  //     return {
  //       ...prev,
  //       modalTextarea,
  //     };
  //   });
  // }, [modalTextarea]);

  // 更新modal input, textarea的值
  // const atChange = React.useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //     const { name, value } = e.target;
  //     setModalData((prev) => {
  //       return {
  //         ...prev,
  //         [name]: value,
  //       };
  //     });
  //   },
  //   [],
  // );

  // 關閉視窗時會重置新增按鈕的modal data
  // const atCloseModal = React.useCallback(() => {
  //   onClose();
  //   if (inputPlaceholder) {
  //     setModalData({ modalInput: '', modalTextarea: '' });
  //   }
  // }, [onClose, setModalData, inputPlaceholder]);

  // 點選back drop可以關閉視窗
  const modalRef = React.useRef(null);
  const atBackdropClick = (e) => {
    if (!modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // 送出填入的資料，送出後關閉彈跳窗
  // const atSubmit = React.useCallback(
  //   (
  //     currentData: {
  //       modalInput: string,
  //       modalTextarea: string,
  //     },
  //     hasInput: boolean,
  //   ) => {
  //     if (!hasInput && !currentData.modalTextarea) {
  //       setModalData((prev) => {
  //         return {
  //           ...prev,
  //           modalTextarea,
  //         };
  //       });
  //     }
  //     onSubmit(currentData, hasInput);
  //     atCloseModal();
  //   },
  //   [onSubmit, atCloseModal, modalTextarea],
  // );

  return isVisible
    ? ReactDOM.createPortal(
        <div className={style.backdrop} onMouseDown={atBackdropClick}>
          <div
            ref={modalRef}
            className={cx(style.modal, 'swal2-show')}
            style={
              maxWidth ? { maxWidth: `${maxWidth}%` } : { maxWidth: `${50}%` }
            }
          >
            <div className={cx(style.modalHeader)}>
              <AiOutlineClose
                className={cx(style.closeBtn)}
                onClick={() => onClose()}
              />
            </div>
            <h2 className={cx(style.modalTitle)}>{title}</h2>
            <div className={cx(style.modalContent)}>
              <div className="mb-3 mt-2">
                <label htmlFor="story" className="form-label">
                  故事名稱
                </label>
                <input
                  className="form-control"
                  id="story"
                  name="story"
                  placeholder="請輸入故事名稱"
                  value={storyInfo.new.story}
                  onChange={(e) => onChangeStoryInfo(e)}
                />
              </div>
              <div className={cx('mb-3 mt-1')}>
                <label htmlFor="category" className="form-label">
                  故事類別
                </label>
                <select
                  className="form-control"
                  id="category"
                  name="category"
                  value={
                    storyInfo.new.create
                      ? 'createNewCategory'
                      : storyInfo.new.category
                  }
                  onChange={(e) => onChangeStoryInfo(e)}
                >
                  <option value="" hidden>
                    請選擇故事類別
                  </option>
                  <option value="createNewCategory">建立新類別</option>
                  {categories?.map((category) => {
                    return (
                      <option
                        key={`${category.id}-${category.name}`}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              {storyInfo.new?.create && (
                <div className="mb-3">
                  <label htmlFor="newCategory" className="form-label">
                    類別名稱
                  </label>
                  <input
                    className="form-control"
                    id="newCategory"
                    name="newCategory"
                    placeholder="請輸入類別名稱"
                    value={storyInfo.new.category}
                    onChange={(e) => onChangeStoryInfo(e)}
                  />
                </div>
              )}
            </div>
            <div className={cx(style.modalFooter)}>
              <button
                className="btn btn-danger modalBtn"
                onClick={() => onClose()}
              >
                取消
              </button>
              <button
                className="btn btn-primary modalBtn"
                onClick={() => {
                  onSubmit(storyInfo, stories, categories);
                  onClose();
                }}
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

export default React.memo(EditStoryModal);
