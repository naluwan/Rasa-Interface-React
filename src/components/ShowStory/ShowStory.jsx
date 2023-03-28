/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/style-prop-object */
import * as React from 'react';
import shallow from 'zustand/shallow';
import UserStep from 'components/UserStep';
import BotStep from 'components/BotStep';
import cx from 'classnames';
import { Toast } from 'utils/swalInput';
import MoreAction from 'components/MoreAction';
import style from './ShowStory.module.scss';
import type { StoryType, State } from '../types';
import useStoryStore from '../../store/useStoryStore';
// import StepControl from '../CreateStory/StepControl';
import CheckPoint from '../CheckPoint';
import moreIcon from '../../images/more_icon.png';
import EditStoryModal from './EditStoryModal';

type ShowStoryProps = {
  setcategoriesName: State,
  story: StoryType,
  isCreate: boolean,
  setNowMode: State,
  atChangeMode: (e: string) => void,
  onDeleteStory: (storyName: string) => void,
};

const ShowStory: React.FC<ShowStoryProps> = (props) => {
  const {
    story,
    isCreate,
    onDeleteStory,
    atChangeMode,
    setNowMode,
    setcategoriesName,
  } = props;

  /**
   * @type {[{ori:{story:string,category:string},new:{story:string,category:string,create?:boolean}}, Function]}
   */
  const [storyInfo, setStoryInfo] = React.useState({
    ori: { story: story.story, category: story.metadata.category },
    new: {
      story: story.story,
      category: story.metadata.category,
    },
  });

  /** 控制是否顯示MoreAction
   * @type {[boolean, Function]}
   */
  const [showMoreAction, setShowMoreAction] = React.useState(false);

  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setStoryInfo({
      ori: { story: story.story, category: story.metadata.category },
      new: {
        story: story.story,
        category: story.metadata.category,
      },
    });
  }, [story]);

  const {
    onEditBotRes,
    onEditUserSay,
    onCreateExample,
    onEditResButtons,
    onRemoveResButton,
    onAddResButtons,
    onEditIntent,
    onCreateEntities,
    onDeleteEntities,
    onEditEntityShowValue,
    onEditEntity,
    onEditEntityValue,
    onDeleteExample,
    onEditBranchStoryBotRes,
    onEditConnectStoryBotRes,
    onAddBranchStoryResButtons,
    onRemoveBranchStoryResButton,
    onEditBranchStoryResButtons,
    onAddConnectStoryResButtons,
    onRemoveConnectStoryResButton,
    onEditConnectStoryResButtons,
    categories,
    stories,
    onEditStoryInfo,
  } = useStoryStore((state: State) => {
    return {
      onEditBotRes: state.onEditBotRes,
      onEditUserSay: state.onEditUserSay,
      onCreateExample: state.onCreateExample,
      onEditResButtons: state.onEditResButtons,
      onRemoveResButton: state.onRemoveResButton,
      onAddResButtons: state.onAddResButtons,
      onEditIntent: state.onEditIntent,
      onCreateEntities: state.onCreateEntities,
      onDeleteEntities: state.onDeleteEntities,
      onEditEntityShowValue: state.onEditEntityShowValue,
      onEditEntity: state.onEditEntity,
      onEditEntityValue: state.onEditEntityValue,
      onDeleteExample: state.onDeleteExample,
      onEditBranchStoryBotRes: state.onEditBranchStoryBotRes,
      onEditConnectStoryBotRes: state.onEditConnectStoryBotRes,
      onAddBranchStoryResButtons: state.onAddBranchStoryResButtons,
      onRemoveBranchStoryResButton: state.onRemoveBranchStoryResButton,
      onEditBranchStoryResButtons: state.onEditBranchStoryResButtons,
      onAddConnectStoryResButtons: state.onAddConnectStoryResButtons,
      onRemoveConnectStoryResButton: state.onRemoveConnectStoryResButton,
      onEditConnectStoryResButtons: state.onEditConnectStoryResButtons,
      categories: state.categories,
      stories: state.stories,
      onEditStoryInfo: state.onEditStoryInfo,
    };
  }, shallow);

  // 更新故事資訊
  const atChangeStoryInfo = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      if (name === 'story') {
        setStoryInfo((prev) => {
          return {
            ...prev,
            new: {
              ...prev.new,
              [name]: value,
            },
          };
        });
      }

      if (name === 'category' && value !== 'createNewCategory') {
        setStoryInfo((prev) => {
          return {
            ...prev,
            new: {
              ...prev.new,
              [name]: value,
              create: false,
            },
          };
        });
      }

      if (name === 'category' && value === 'createNewCategory') {
        setStoryInfo((prev) => {
          return {
            ...prev,
            new: {
              ...prev.new,
              category: '',
              create: true,
            },
          };
        });
      }

      if (name === 'newCategory') {
        setStoryInfo((prev) => {
          return {
            ...prev,
            new: {
              ...prev.new,
              category: value,
            },
          };
        });
      }
    },
    [setStoryInfo],
  );

  // 驗證storyInfo資料，無誤後將資料送進onEditStoryInfo更新故事資訊
  const atEditStoryInfo = React.useCallback(
    (storyInfoData, storiesData, categoriesData) => {
      if (
        storyInfoData.ori.story === storyInfoData.new.story &&
        storyInfoData.ori.category === storyInfoData.new.category
      )
        return;

      if (storyInfoData.new.story === '' || storyInfoData.new.category === '') {
        Toast.fire({
          icon: 'warning',
          title: '所有欄位都是必填的',
        });
        return;
      }

      let isRepeat = false;

      if (storyInfoData.ori.story !== storyInfoData.new.story) {
        isRepeat = storiesData.some(
          (item) => item.story === storyInfoData.new.story,
        );

        if (isRepeat) {
          setStoryInfo((prev) => {
            return {
              ...prev,
              new: {
                ...prev.new,
                story: '',
              },
            };
          });
          Toast.fire({
            icon: 'warning',
            title: '故事名稱重複',
          });
          document.querySelector('.form-control#story').focus();
          return;
        }
      }

      if (storyInfoData.new.create) {
        isRepeat = categoriesData.some(
          (category) => category.name === storyInfoData.new.category,
        );

        if (isRepeat) {
          setStoryInfo((prev) => {
            return {
              ...prev,
              new: {
                ...prev.new,
                category: '',
              },
            };
          });
          Toast.fire({
            icon: 'warning',
            title: '類別名稱重複',
          });
          document.querySelector('.form-control#newCategory').focus();
          return;
        }
      }

      onEditStoryInfo(storyInfoData);
    },
    [onEditStoryInfo],
  );

  // 點擊背景關閉MoreAction
  const moreActionRef = React.useRef(null);
  const atBackdropClick = (e) => {
    if (
      moreActionRef.current &&
      e.target.getAttribute('alt') !== 'more_icon' &&
      !moreActionRef.current.contains(e.target)
    ) {
      setShowMoreAction(false);
    }
  };

  const atCloseEditStoryModal = React.useCallback(() => {
    setIsVisible(false);
    setStoryInfo({
      ori: {
        story: story.story,
        category: story.metadata.category,
      },
      new: {
        story: story.story,
        category: story.metadata.category,
      },
    });
  }, [setStoryInfo, story]);

  return (
    <div
      data-showstory
      className={style.root}
      onMouseDown={(e) => atBackdropClick(e)}
    >
      <div className={cx('container', style.h_1)}>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <button
                className={cx(style.showBreadcrumbBtn)}
                onClick={() => atChangeMode('scenario')}
              >
                情境劇本
              </button>
            </li>
            <li
              className="breadcrumb-item"
              onClick={() => {
                setNowMode('scenario');
                setcategoriesName(`${story.metadata.category}`);
              }}
            >
              <span className={cx(style.showBreadcrumbBtn)}>
                {story.metadata.category}
              </span>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <span className={cx(style.showBreadcrumbBtn, style.active)}>
                {story.story}
              </span>
            </li>
          </ol>
        </nav>
        <div className="d-flex justify-content-center">
          <div
            className={cx('d-flex col-10 align-items-center', style.tilteBlock)}
          >
            <div className={style.title}>{story.story}</div>
            {story.story !== '問候語' && story.story !== '預設回覆' && (
              <div
                className={cx(
                  ' d-flex justify-content-between',
                  style.editBlock,
                )}
              >
                <div className={cx(style.moreActionContainer)}>
                  <button
                    className={cx(style.moreAction)}
                    onClick={() => setShowMoreAction((prev) => !prev)}
                  >
                    <img src={moreIcon} alt="more_icon" />
                  </button>
                  {showMoreAction && (
                    <MoreAction
                      ref={moreActionRef}
                      onSetShowMoreAction={setShowMoreAction}
                      onDeleteStory={() => onDeleteStory(story.story)}
                      onSetIsVisible={setIsVisible}
                    />
                  )}
                </div>
                {/* <button
                  type="button"
                  className={cx('btn btn-primary mx-4', style.deletStory)}
                  data-bs-toggle="modal"
                  data-bs-target={`#edit${story.story}StoryModal`}
                >
                  編輯
                </button>
                <button
                  type="button"
                  className={cx('btn btn-danger mx-4', style.deletStory)}
                  onClick={() => onDeleteStory(story.story)}
                >
                  刪除故事
                </button> */}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={cx('container', style.h_9)}>
        <div className=" h-100">
          <div className={style.stepsPanel}>
            {story.steps.map((step) => {
              const {
                intent,
                user,
                entities,
                examples,
                action,
                response,
                buttons,
                checkpoint,
                branchStories,
              } = step;
              if (step.intent) {
                return (
                  <UserStep
                    key={step.intent}
                    step={{ intent, user, entities, examples }}
                    storyName={story.story}
                    onCreateExample={onCreateExample}
                    onEditUserSay={onEditUserSay}
                    onEditIntent={onEditIntent}
                    onCreateEntities={onCreateEntities}
                    onDeleteEntities={onDeleteEntities}
                    onEditEntityShowValue={onEditEntityShowValue}
                    onEditEntity={onEditEntity}
                    onEditEntityValue={onEditEntityValue}
                    onDeleteExample={onDeleteExample}
                  />
                );
              }

              if (step.action) {
                return (
                  <BotStep
                    key={step.action}
                    step={{ action, response, buttons }}
                    storyName={story.story}
                    onEditBotRes={onEditBotRes}
                    onEditResButtons={onEditResButtons}
                    onRemoveResButton={onRemoveResButton}
                    onAddResButtons={onAddResButtons}
                  />
                );
              }

              return (
                <CheckPoint
                  isCreate={isCreate}
                  key={checkpoint}
                  branch={branchStories}
                  onEditBranchStoryBotRes={onEditBranchStoryBotRes}
                  onEditConnectStoryBotRes={onEditConnectStoryBotRes}
                  onAddBranchStoryResButtons={onAddBranchStoryResButtons}
                  onRemoveBranchStoryResButton={onRemoveBranchStoryResButton}
                  onEditBranchStoryResButtons={onEditBranchStoryResButtons}
                  onAddConnectStoryResButtons={onAddConnectStoryResButtons}
                  onRemoveConnectStoryResButton={onRemoveConnectStoryResButton}
                  onEditConnectStoryResButtons={onEditConnectStoryResButtons}
                />
              );
            })}
            {/* <StepControl /> */}
          </div>
        </div>
        {/* edit story modal */}
        <div
          className="modal"
          id={`edit${story.story}StoryModal`}
          tabIndex="-1"
          aria-labelledby={`edit${story.story}StoryModalLabel`}
          aria-hidden="true"
          data-bs-backdrop="false"
        >
          <div className="modal-dialog  modal-lg modal-dialog-scrollable">
            <div className={cx('modal-content swal2-show', style.swtOut)}>
              <div>
                <h2
                  className="swal2-title"
                  id={`edit${story.story}StoryModalLabel`}
                >
                  編輯故事資訊
                </h2>
                <button
                  type="button"
                  className={cx('swal2-close', style.swetClose)}
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() =>
                    setStoryInfo({
                      ori: {
                        story: story.story,
                        category: story.metadata.category,
                      },
                      new: {
                        story: story.story,
                        category: story.metadata.category,
                      },
                    })
                  }
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="story" className="form-label">
                    故事名稱
                  </label>
                  <input
                    className="form-control"
                    id="story"
                    name="story"
                    placeholder="請輸入故事名稱"
                    value={storyInfo.new.story}
                    onChange={(e) => atChangeStoryInfo(e)}
                  />
                </div>
                <div className="mb-3">
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
                    onChange={(e) => atChangeStoryInfo(e)}
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
                      onChange={(e) => atChangeStoryInfo(e)}
                    />
                  </div>
                )}
              </div>
              <div className="swal2-actions d-flex">
                <button
                  type="button"
                  className="swal2-cancel swal2-styled"
                  id="cancelEditStoryBtn"
                  data-bs-dismiss="modal"
                  onClick={() =>
                    setStoryInfo({
                      ori: {
                        story: story.story,
                        category: story.metadata.category,
                      },
                      new: {
                        story: story.story,
                        category: story.metadata.category,
                      },
                    })
                  }
                >
                  取消
                </button>
                <button
                  className="swal2-confirm swal2-styled"
                  onClick={() =>
                    atEditStoryInfo(storyInfo, stories, categories)
                  }
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditStoryModal
        title="編輯故事資訊"
        isVisible={isVisible}
        storyInfo={storyInfo}
        onChangeStoryInfo={atChangeStoryInfo}
        onClose={atCloseEditStoryModal}
        categories={categories}
        stories={stories}
        onSubmit={atEditStoryInfo}
      />
    </div>
  );
};

export default React.memo(ShowStory);
