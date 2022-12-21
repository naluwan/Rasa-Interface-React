import * as React from 'react';
import cx from 'classnames';
// import { RiCloseCircleFill } from 'react-icons/ri';
import shallow from 'zustand/shallow';
import uuid from 'react-uuid';
import useStoryStore from 'store/useStoryStore';
import style from './CheckPoint.module.scss';
import type { StoryType, CreateStoryState, State } from '../types';
import NavTab from './NavTab';
import BotStep from '../BotStep';
import ShowSlots from './ShowSlots';
import useCreateStoryStore from '../../store/useCreateStoryStore';
import ConnectBranchStory from './ConnectBranchStory';

type CheckPointProps = {
  branch: StoryType[],
  isCreate: boolean,
  onDeleteBranchStory: (checkPointName: string, branchName: string) => void,
  onEditBranchStoryBotRes: (
    oriBotRes: string,
    botRes: string,
    actionName: string,
    storyName: string,
    checkPointName: string,
  ) => void,
  onEditConnectStoryBotRes: (
    oriBotRes: string,
    botRes: string,
    actionName: string,
    storyName: string,
    checkPointName: String,
    connectStoryName: string,
  ) => void,
  onAddBranchStoryResButtons: (
    actionName: string,
    title: string,
    payload: string,
    reply: string,
    storyName: string,
    stories: StoryType[],
    checkPointName: string,
  ) => void,
  onRemoveBranchStoryResButton: (
    actionName: string,
    payload: string,
    storyName: string,
    buttonActionName: string,
    disabled: boolean,
    checkPointName: string,
  ) => void,
  onEditBranchStoryResButtons: (
    actionName: string,
    title: string,
    oriPayload: string,
    payload: string,
    reply: string,
    storyName: string,
    buttonActionName: string,
    stories: StoryType[],
    checkPointName: string,
  ) => void,
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
};

const CheckPoint: React.FC<CheckPointProps> = (props) => {
  const {
    branch,
    isCreate,
    onDeleteBranchStory,
    onEditBranchStoryBotRes,
    onAddBranchStoryResButtons,
    onRemoveBranchStoryResButton,
    onEditBranchStoryResButtons,
    onEditConnectStoryBotRes,
    onAddConnectStoryResButtons,
    onRemoveConnectStoryResButton,
    onEditConnectStoryResButtons,
  } = props;

  const { onRemoveBranchStory } = useStoryStore((state: State) => {
    return {
      onRemoveBranchStory: state.onRemoveBranchStory,
    };
  });

  const {
    selectedBranchStory,
    onSetSelectedBranchStory,
    onSetSelectedConnectBranchStory,
    onSetBranchStep,
    onSetCheckPointName,
    onSetMainStep,
  } = useCreateStoryStore((state: CreateStoryState) => {
    return {
      selectedBranchStory: state.selectedBranchStory,
      onSetBranchStep: state.onSetBranchStep,
      onSetCheckPointName: state.onSetCheckPointName,
      onSetSelectedBranchStory: state.onSetSelectedBranchStory,
      onSetSelectedConnectBranchStory: state.onSetSelectedConnectBranchStory,
      onSetMainStep: state.onSetMainStep,
    };
  }, shallow);
  /* 
    當branch傳進來或內容發生改變時，永遠設定第一個為被選取的支線故事
    因更新資料時，畫面會閃爍，所以需要使用useLayoutEffect()來設定選取故事
    useEffect - 瀏覽器更新後才執行
    useLayoutEffect - 瀏覽器更新前執行，useLayoutEffect是同步處理，如果處理太多事情會卡住執行續
  */
  // React.useLayoutEffect(() => {
  //   onSetSelectedBranchStory({
  //     story: branch[0].story,
  //     steps: branch[0].steps,
  //   });
  // }, [onSetSelectedBranchStory, branch]);

  // 選取支線故事或刪除支線故事
  const atClickTab = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, storyName: string) => {
      const { target } = e;

      // 刪除支線故事
      if (!target.id.includes('story_nav_tab')) {
        const idx = storyName.lastIndexOf('_');
        const checkPointName = `${storyName.slice(0, idx)}_主線`;

        if (storyName === selectedBranchStory.story) {
          if (branch.length > 1) {
            const allBranchName = branch.map((item) => item.story);
            const deleteStoryIdx = allBranchName.indexOf(storyName);
            const beforeDeleteStory = branch[deleteStoryIdx - 1];
            onSetSelectedBranchStory(beforeDeleteStory);
          } else {
            onSetSelectedBranchStory({
              story: '',
              steps: [],
            });
          }
        }
        if (!isCreate) {
          return onRemoveBranchStory(checkPointName, storyName);
        }
        return onDeleteBranchStory(checkPointName, storyName);
      }

      // 選取故事
      onSetSelectedConnectBranchStory({
        story: '',
        steps: [],
      });
      const currentSelectedStory = branch.filter(
        (item) => item.story === storyName,
      )[0];
      return onSetSelectedBranchStory(currentSelectedStory);
    },
    [
      onSetSelectedBranchStory,
      onDeleteBranchStory,
      branch,
      selectedBranchStory,
      onSetSelectedConnectBranchStory,
      onRemoveBranchStory,
      isCreate,
    ],
  );

  // 點擊串接支線故事
  const atClickCreateBranch = React.useCallback(
    (checkPointName: string) => {
      onSetBranchStep();
      onSetCheckPointName(checkPointName);
    },
    [onSetBranchStep, onSetCheckPointName],
  );

  return (
    <div className={style.root} id="checkPointStep">
      <nav>
        <div
          className={cx('nav nav-tabs', style.tablist)}
          id="nav-tab"
          role="tablist"
        >
          {branch.map((item) => {
            const { story } = item;
            // console.log('branchStory.story:', branchStory.story);
            // console.log('story:', story);
            return (
              <NavTab
                key={`${uuid()}-${item.story}`}
                story={story}
                isActive={selectedBranchStory?.story === story}
                onClickTab={atClickTab}
              />
            );
          })}
          {branch.length > 0 && (
            <button
              className={cx('nav-link', style.checkPointNavTab)}
              id="createBranchStoryBtn"
              data-bs-toggle="modal"
              data-bs-target="#createBranchStoryModal"
              onClick={() => onSetMainStep()}
              type="button"
            >
              +支線
            </button>
          )}
        </div>
      </nav>
      <div className={cx('tab-content', style.tabContent)} id="nav-tabContent">
        <div
          className="tab-pane fade show active"
          id="nav-home"
          role="tabpanel"
          aria-labelledby="nav-home-tab"
          tabIndex="-1"
        >
          {selectedBranchStory?.steps?.length > 0 &&
            // eslint-disable-next-line array-callback-return, consistent-return
            selectedBranchStory.steps.map((step) => {
              const {
                // eslint-disable-next-line camelcase
                slot_was_set,
                action,
                response,
                buttons,
              } = step;

              if (step.slot_was_set) {
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
                return (
                  <BotStep
                    key={action}
                    step={{ action, response, buttons }}
                    checkPointName={selectedBranchStory.story}
                    onEditBotRes={onEditBranchStoryBotRes}
                    onAddResButtons={onAddBranchStoryResButtons}
                    onRemoveResButton={onRemoveBranchStoryResButton}
                    onEditResButtons={onEditBranchStoryResButtons}
                  />
                );
              }
            })}
          {selectedBranchStory?.steps?.length >= 2 &&
            selectedBranchStory.steps.every((step) => !step.action) &&
            selectedBranchStory.steps.map(
              (step, idx) =>
                idx !== 0 &&
                step.checkpoint && (
                  <ConnectBranchStory
                    key={`${uuid()}-${step.checkpoint}`}
                    isCreate={isCreate}
                    branch={step.branchStories}
                    onClickCreateBranch={atClickCreateBranch}
                    onEditConnectStoryBotRes={onEditConnectStoryBotRes}
                    onAddConnectStoryResButtons={onAddConnectStoryResButtons}
                    onRemoveConnectStoryResButton={
                      onRemoveConnectStoryResButton
                    }
                    onEditConnectStoryResButtons={onEditConnectStoryResButtons}
                  />
                ),
            )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CheckPoint);
