import * as React from 'react';
import cx from 'classnames';
// import { RiCloseCircleFill } from 'react-icons/ri';
import shallow from 'zustand/shallow';
import uuid from 'react-uuid';
import style from './CheckPoint.module.scss';
import type { StoryType } from '../types';
import NavTab from './NavTab';
import BotStep from '../BotStep';
import ShowSlots from './ShowSlots';
import useCreateStoryStore from '../../store/useCreateStoryStore';
import ConnectBranchStory from './ConnectBranchStory';

type CheckPointProps = {
  branch: StoryType[],
  onDeleteBranchStory: (checkPointName: string, branchName: string) => void,
};

const CheckPoint: React.FC<CheckPointProps> = (props) => {
  const { branch, onDeleteBranchStory } = props;
  // console.log('inside CheckPoint branchStories:', branch);
  // const [branchStory, setBranchStory] = React.useState({
  //   story: '',
  //   steps: [],
  // });
  // console.log('branchStory first:', branchStory);

  const {
    selectedStory,
    onSetSelectedBranchStory,
    onSetBranchStep,
    onSetCheckPointName,
    onDeleteConnectBranchStory,
    onSetSelectedConnectBranchStory,
  } = useCreateStoryStore((state: State) => {
    return {
      selectedStory: state.selectedStory,
      onSetBranchStep: state.onSetBranchStep,
      onSetCheckPointName: state.onSetCheckPointName,
      onDeleteConnectBranchStory: state.onDeleteConnectBranchStory,
      onSetSelectedBranchStory: state.onSetSelectedBranchStory,
      onSetSelectedConnectBranchStory: state.onSetSelectedConnectBranchStory,
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
      if (target.id !== 'nav-home-tab') {
        const idx = storyName.lastIndexOf('_');
        const checkPointName = `${storyName.slice(0, idx)}_主線`;

        if (storyName === selectedStory.story) {
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
      selectedStory,
      onSetSelectedConnectBranchStory,
    ],
  );

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
        <div className="nav nav-tabs" id="nav-tab" role="tablist">
          {branch.map((item) => {
            const { story, steps } = item;
            // console.log('branchStory.story:', branchStory.story);
            // console.log('story:', story);
            return (
              <NavTab
                key={`${uuid()}-${item.story}`}
                story={story}
                steps={steps}
                isActive={selectedStory?.story === story}
                onClickTab={atClickTab}
              />
            );
          })}
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
          {selectedStory?.steps?.length > 0 &&
            // eslint-disable-next-line array-callback-return, consistent-return
            selectedStory.steps.map((step, idx) => {
              const {
                // eslint-disable-next-line camelcase
                slot_was_set,
                checkpoint,
                branchStories,
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
                  <BotStep key={action} step={{ action, response, buttons }} />
                );
              }

              if (idx !== 0 && step.checkpoint && branchStories.length) {
                return (
                  <ConnectBranchStory
                    key={`${uuid()}-${checkpoint}`}
                    branch={branchStories}
                    onDeleteConnectBranchStory={onDeleteConnectBranchStory}
                  />
                );
              }
            })}
          {selectedStory?.steps?.length > 0 &&
            selectedStory.steps.every(
              (step) => !step.action || step.checkpoint,
            ) && (
              <div className="d-flex justify-content-end mt-3">
                <div className="col-6">
                  <button
                    className="btn btn-warning"
                    data-bs-toggle="modal"
                    data-bs-target="#createBranchStoryModal"
                    onClick={() => atClickCreateBranch(selectedStory.story)}
                  >
                    串接支線故事
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CheckPoint);
