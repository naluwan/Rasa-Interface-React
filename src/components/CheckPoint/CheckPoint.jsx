import * as React from 'react';
import cx from 'classnames';
// import { RiCloseCircleFill } from 'react-icons/ri';
import style from './CheckPoint.module.scss';
import type { StoryType } from '../types';
import NavTab from './NavTab';
import BotStep from '../BotStep';
import ShowSlots from './ShowSlots';

type CheckPointProps = {
  branch: StoryType[],
  onDeleteBranchStory: (checkPointName: string, branchName: string) => void,
};

const CheckPoint: React.FC<CheckPointProps> = (props) => {
  const { branch, onDeleteBranchStory } = props;
  const [branchStory, setBranchStory] = React.useState({
    story: branch[0].story,
    steps: branch[0].steps,
  });
  console.log('branchStory first:', branchStory);

  /* 
    當branch傳進來或內容發生改變時，永遠設定第一個為被選取的支線故事
    因更新資料時，畫面會閃爍，所以需要使用useLayoutEffect()來設定選取故事
    useEffect - 瀏覽器更新後才執行
    useLayoutEffect - 瀏覽器更新前執行，useLayoutEffect是同步處理，如果處理太多事情會卡住執行續
  */
  React.useLayoutEffect(() => {
    setBranchStory({
      story: branch[0].story,
      steps: branch[0].steps,
    });
  }, [setBranchStory, branch]);

  // 選取支線故事或刪除支線故事
  const atClickTab = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, storyName: string) => {
      const { target } = e;

      // 刪除支線故事
      if (target.id !== 'nav-home-tab') {
        const idx = storyName.lastIndexOf('_');
        const checkPointName = `${storyName.slice(0, idx)}_主線`;
        // 刪除支線故事時，要將目前選取故事設為空
        setBranchStory({});
        return onDeleteBranchStory(checkPointName, storyName);
      }

      // 選取故事
      const selectedStory = branch.filter(
        (item) => item.story === storyName,
      )[0];
      return setBranchStory(selectedStory);
    },
    [setBranchStory, onDeleteBranchStory, branch],
  );

  return (
    <div className={style.root} id="checkPointStep">
      <nav>
        <div className="nav nav-tabs" id="nav-tab" role="tablist">
          {branch.map((item) => {
            const { story, steps } = item;
            console.log('branchStory.story:', branchStory.story);
            console.log('story:', story);
            return (
              <NavTab
                key={item.story}
                story={story}
                steps={steps}
                isActive={branchStory.story === story}
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
          {branchStory.steps?.length &&
            // eslint-disable-next-line array-callback-return, consistent-return
            branchStory.steps.map((step) => {
              console.log('step.slot_was_set:', step.slot_was_set);
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
                      slotKey={slotKey}
                      slotValue={slotValue}
                    />
                  );
                });
              }

              if (step.action) {
                const { action, response, buttons } = step;
                return <BotStep step={{ action, response, buttons }} />;
              }
            })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CheckPoint);
