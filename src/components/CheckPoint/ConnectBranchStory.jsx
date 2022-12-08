import * as React from 'react';
import ReactDom from 'react-dom';
// import shallow from 'zustand/shallow';
import uuid from 'react-uuid';
import cx from 'classnames';
import shallow from 'zustand/shallow';
import useCreateStoryStore from '../../store/useCreateStoryStore';
import NavTab from './NavTab';
import style from './CheckPoint.module.scss';
import ShowSlots from './ShowSlots';
import BotStep from '../BotStep';
import type { CreateStoryState } from '../types';

type ConnectBranchStoryProps = {
  branch: StoryType[],
  onDeleteConnectBranchStory: (
    checkPointName: string,
    branchName: string,
  ) => void,
};

const ConnectBranchStory: React.FC<ConnectBranchStoryProps> = (props) => {
  const { branch, domTarget, onDeleteConnectBranchStory } = props;

  const { selectedConnectBranchStory, onSetSelectedConnectBranchStory } =
    useCreateStoryStore((state: CreateStoryState) => {
      return {
        selectedConnectBranchStory: state.selectedConnectBranchStory,
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
      if (target.id !== 'nav-home-tab') {
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
        return onDeleteConnectBranchStory(checkPointName, storyName);
      }

      // 選取故事
      const selectedStory = branch.filter(
        (item) => item.story === storyName,
      )[0];
      console.log('selectedStory ===>', selectedStory);
      return onSetSelectedConnectBranchStory(selectedStory);
    },
    [
      onSetSelectedConnectBranchStory,
      onDeleteConnectBranchStory,
      branch,
      selectedConnectBranchStory,
    ],
  );

  const portalTarget = domTarget || document.querySelector('#nav-tabContent');

  return ReactDom.createPortal(
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
                isActive={selectedConnectBranchStory?.story === story}
                onClickTab={atClickTab}
              />
            );
          })}
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
                  <BotStep key={action} step={{ action, response, buttons }} />
                );
              }
            })}
        </div>
      </div>
    </div>,
    portalTarget,
  );
};

export default React.memo(ConnectBranchStory);
