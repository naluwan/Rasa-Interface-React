import * as React from 'react';
// import ReactDom from 'react-dom';
import uuid from 'react-uuid';
import cx from 'classnames';
import shallow from 'zustand/shallow';
import useStoryStore from 'store/useStoryStore';
import useCreateStoryStore from '../../store/useCreateStoryStore';
import NavTab from './NavTab';
import style from './CheckPoint.module.scss';
import ShowSlots from './ShowSlots';
import BotStep from '../BotStep';
import type { CreateStoryState, State } from '../types';

type ConnectBranchStoryProps = {
  isCreate: boolean,
  branch: StoryType[],
  onDeleteConnectBranchStory: (
    checkPointName: string,
    branchName: string,
  ) => void,
  onClickCreateBranch: (checkPointName: string) => void,
  onAddConnectStoryResButtons: (
    actionName: string,
    title: string,
    payload: string,
    reply: string,
    storyName: string,
    stories: StoryType[],
    checkPointName: string,
    connectStoryName: string,
  ) => void,
  onRemoveConnectStoryResButton: (
    actionName: string,
    payload: string,
    storyName: string,
    buttonActionName: string,
    disabled: boolean,
    checkPointName: string,
    connectStoryName: string,
  ) => void,
  onEditConnectStoryResButtons: (
    actionName: string,
    title: string,
    oriPayload: string,
    payload: string,
    reply: string,
    storyName: string,
    buttonActionName: string,
    stories: StoryType[],
    checkPointName: string,
    connectStoryName: string,
  ) => void,
  onEditConnectStoryBotRes: (
    oriBotRes: string,
    botRes: string,
    actionName: string,
    storyName: string,
    checkPointName: String,
    connectStoryName: string,
  ) => void,
};

const ConnectBranchStory: React.FC<ConnectBranchStoryProps> = (props) => {
  const {
    branch,
    isCreate,
    onClickCreateBranch,
    onAddConnectStoryResButtons,
    onRemoveConnectStoryResButton,
    onEditConnectStoryResButtons,
    onEditConnectStoryBotRes,
  } = props;

  const { onRemoveConnectStory } = useStoryStore((state: State) => {
    return {
      onRemoveConnectStory: state.onRemoveConnectStory,
    };
  });

  const {
    selectedBranchStory,
    selectedConnectBranchStory,
    onSetSelectedConnectBranchStory,
    onDeleteConnectBranchStory,
  } = useCreateStoryStore((state: CreateStoryState) => {
    return {
      selectedBranchStory: state.selectedBranchStory,
      selectedConnectBranchStory: state.selectedConnectBranchStory,
      onSetSelectedConnectBranchStory: state.onSetSelectedConnectBranchStory,
      onDeleteConnectBranchStory: state.onDeleteConnectBranchStory,
    };
  }, shallow);

  /* 
    當branch傳進來或內容發生改變時，永遠設定第一個為被選取的支線故事
    因更新資料時，畫面會閃爍，所以需要使用useLayoutEffect()來設定選取故事
    useEffect - 瀏覽器更新後才執行
    useLayoutEffect - 瀏覽器更新前執行，useLayoutEffect是同步處理，如果處理太多事情會卡住執行續
  */
  // React.useLayoutEffect(() => {
  //   setBranchStory({
  //     story: branch[0].story,
  //     steps: branch[0].steps,
  //   });
  // }, [setBranchStory, branch]);

  // 選取支線故事或刪除支線故事
  const atClickTab = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, storyName: string) => {
      const { target } = e;

      // 刪除支線故事
      if (!target.id.includes('story_nav_tab')) {
        const idx = storyName.lastIndexOf('_');
        const checkPointName = `${storyName.slice(0, idx)}_主線`;

        if (storyName === selectedConnectBranchStory.story) {
          if (branch.length > 1) {
            const allBranchName = branch.map((item) => item.story);
            const deleteStoryIdx = allBranchName.indexOf(storyName);
            const beforeDeleteStory = branch[deleteStoryIdx - 1];
            onSetSelectedConnectBranchStory(beforeDeleteStory);
          } else {
            onSetSelectedConnectBranchStory({
              story: '',
              steps: [],
            });
          }
        }
        if (!isCreate) {
          return onRemoveConnectStory(checkPointName, storyName);
        }
        return onDeleteConnectBranchStory(checkPointName, storyName);
      }

      // 選取故事
      const currentSelectedBranchStory = branch.filter(
        (item) => item.story === storyName,
      )[0];
      return onSetSelectedConnectBranchStory(currentSelectedBranchStory);
    },
    [
      onSetSelectedConnectBranchStory,
      onDeleteConnectBranchStory,
      branch,
      selectedConnectBranchStory,
      isCreate,
      onRemoveConnectStory,
    ],
  );

  // const portalTarget =
  //   domTarget || document.querySelector('#connectStoryContainer');
  // console.log(
  //   'selectedBranchStory.steps.some((branchStep, idx) => idx !== 0 && branchStep.checkpoint) ===>',
  //   selectedBranchStory.steps.some(
  //     (branchStep, idx) => idx !== 0 && branchStep.checkpoint,
  //   ),
  // );

  return (
    <div className={style.root} id="checkPointStep">
      <nav>
        <div
          className={cx('nav nav-tabs', style.tablist)}
          id="nav-tab"
          role="tablist"
        >
          {branch?.map((item) => {
            const { story } = item;
            // console.log('branchStory.story:', branchStory.story);
            // console.log('story:', story);
            return (
              <NavTab
                key={`${uuid()}-${item.story}`}
                story={story}
                isActive={selectedConnectBranchStory?.story === story}
                onClickTab={atClickTab}
              />
            );
          })}
          <button
            className={cx('nav-link', style.checkPointNavTab)}
            id="createBranchStoryBtn"
            data-bs-toggle="modal"
            data-bs-target="#createBranchStoryModal"
            onClick={() => onClickCreateBranch(selectedBranchStory.story)}
            type="button"
          >
            +串接
          </button>
        </div>
      </nav>
      <div
        className={cx('tab-content', style.tabContent)}
        id="connect-branch-story-nav-tabContent"
      >
        <div
          className="tab-pane fade show active"
          id="nav-home"
          role="tabpanel"
          aria-labelledby="nav-home-tab"
          tabIndex="-1"
        >
          {selectedConnectBranchStory?.steps?.length > 0 &&
            // eslint-disable-next-line array-callback-return, consistent-return
            selectedConnectBranchStory.steps.map((step) => {
              if (step.slot_was_set) {
                // eslint-disable-next-line camelcase
                const { slot_was_set } = step;
                // eslint-disable-next-line camelcase
                return slot_was_set.map((slot) => {
                  const slotKey = Object.keys(slot)[0];
                  const slotValue = Object.values(slot)[0];
                  return (
                    <ShowSlots
                      key={`${slotKey}-${slotValue}`}
                      slotInfo={{ slotKey, slotValue }}
                    />
                  );
                });
              }

              if (step.action) {
                const { action, response, buttons } = step;
                return (
                  <BotStep
                    key={action}
                    step={{ action, response, buttons }}
                    checkPointName={selectedBranchStory.story}
                    connectBranchStoryName={selectedConnectBranchStory.story}
                    onEditBotRes={onEditConnectStoryBotRes}
                    onAddResButtons={onAddConnectStoryResButtons}
                    onRemoveResButton={onRemoveConnectStoryResButton}
                    onEditResButtons={onEditConnectStoryResButtons}
                  />
                );
              }
            })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConnectBranchStory);
