import * as React from 'react';
// import { Toast } from 'utils/swalInput';
import shallow from 'zustand/shallow';
import CheckPoint from 'components/CheckPoint';
import useStoryStore from 'store/useStoryStore';
import style from './CreateStory.module.scss';
import StepControl from './StepControl';
import UserStep from '../UserStep';
import BotStep from '../BotStep';
import type { StoryType, ExampleType, CreateStoryState, State } from '../types';
import StepAlert from './StepAlert';
import useCreateStoryStore from '../../store/useCreateStoryStore';

type CreateStoryProps = {
  isCreate: boolean,
  newStory: StoryType,
  nlu: ExampleType[],
  actions: string[],
  onClickSaveBtn: (story: StoryType) => void,
};

const CreateStory: React.FC<CreateStoryProps> = (props) => {
  const { isCreate, nlu, actions, onClickSaveBtn } = props;

  const { categories } = useStoryStore((state: State) => {
    return {
      categories: state.categories,
    };
  }, shallow);

  const {
    newStory,
    onEditUserSay,
    onEditIntent,
    onCreateExample,
    onDeleteExample,
    onCreateEntities,
    onDeleteEntities,
    onEditEntityShowValue,
    onEditEntity,
    onEditEntityValue,
    onEditBotRes,
    onRemoveUserStep,
    onRemoveBotStep,
    onAddResButtons,
    onEditResButtons,
    onRemoveResButton,
    onCreateBranchStory,
    onDeleteBranchStory,
    onEditBranchStoryBotRes,
    onEditConnectStoryBotRes,
    onAddBranchStoryResButtons,
    onRemoveBranchStoryResButton,
    onEditBranchStoryResButtons,
    onAddConnectStoryResButtons,
    onRemoveConnectStoryResButton,
    onEditConnectStoryResButtons,
  } = useCreateStoryStore((state: CreateStoryState) => {
    return {
      newStory: state.newStory,
      onEditUserSay: state.onEditUserSay,
      onEditIntent: state.onEditIntent,
      onCreateExample: state.onCreateExample,
      onDeleteExample: state.onDeleteExample,
      onCreateEntities: state.onCreateEntities,
      onDeleteEntities: state.onDeleteEntities,
      onEditEntityShowValue: state.onEditEntityShowValue,
      onEditEntity: state.onEditEntity,
      onEditEntityValue: state.onEditEntityValue,
      onEditBotRes: state.onEditBotRes,
      onRemoveUserStep: state.onRemoveUserStep,
      onRemoveBotStep: state.onRemoveBotStep,
      onAddResButtons: state.onAddResButtons,
      onEditResButtons: state.onEditResButtons,
      onRemoveResButton: state.onRemoveResButton,
      onCreateBranchStory: state.onCreateBranchStory,
      onDeleteBranchStory: state.onDeleteBranchStory,
      onEditBranchStoryBotRes: state.onEditBranchStoryBotRes,
      onEditConnectStoryBotRes: state.onEditConnectStoryBotRes,
      onAddBranchStoryResButtons: state.onAddBranchStoryResButtons,
      onRemoveBranchStoryResButton: state.onRemoveBranchStoryResButton,
      onEditBranchStoryResButtons: state.onEditBranchStoryResButtons,
      onAddConnectStoryResButtons: state.onAddConnectStoryResButtons,
      onRemoveConnectStoryResButton: state.onRemoveConnectStoryResButton,
      onEditConnectStoryResButtons: state.onEditConnectStoryResButtons,
    };
  }, shallow);
  /**
   * @type {[boolean, Function]}
   */
  const [isUser, setIsUser] = React.useState(false);
  // /**
  //  * @type {[boolean, Function]}
  //  */
  const [hasBranch, setHasBranch] = React.useState(false);

  const [isInputFocus, setIsInputFocus] = React.useState(undefined);

  React.useEffect(() => {
    // 雙驚嘆號為判斷是否存在，只返回boolean
    /*
    判斷目前已新增的步驟是否為使用者步驟
    true => 新增故事的使用者按鈕會變成『不可點擊狀態』；機器人和支線故事按鈕改為『可點擊狀態』
    false => 新增故事的使用者按鈕會變成『可點擊狀態』；機器人和支線故事按鈕改為『不可點擊狀態』
    */
    setIsUser(
      newStory.steps?.length
        ? !!newStory.steps[newStory.steps.length - 1].intent ||
            !!newStory.steps[newStory.steps.length - 1].checkpoint
        : false,
    );

    setHasBranch(
      newStory.steps?.length
        ? !!newStory.steps[newStory.steps.length - 1].checkpoint
        : false,
    );
  }, [setIsUser, newStory]);

  // 控制顯示目前設定是誰的步驟
  let CurStepAlert;
  if (!isUser) {
    if (isInputFocus) {
      CurStepAlert = <StepAlert stepRole="user" />;
    }
  } else if (isInputFocus) {
    CurStepAlert = <StepAlert stepRole="bot" />;
  }

  return (
    <div className={style.root}>
      <div className="col d-flex align-items-center">
        <div className={style.title}>{newStory.story}</div>
        <button
          type="button"
          className="btn btn-secondary mx-4"
          onClick={() => onClickSaveBtn(newStory, false, categories)}
        >
          儲存
        </button>
      </div>
      <div className={style.stepsPanel} id="stepsPanel">
        {newStory?.steps?.length > 0 &&
          newStory.steps.map((step) => {
            // 要先將值取出來，再當作props傳進去，React才會檢查到有改變需要重新render
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
                  isCreate={isCreate}
                  step={{ intent, user, entities, examples }}
                  storyName={newStory.story}
                  newStory={newStory}
                  onEditUserSay={onEditUserSay}
                  onEditIntent={onEditIntent}
                  onCreateExample={onCreateExample}
                  onDeleteExample={onDeleteExample}
                  onCreateEntities={onCreateEntities}
                  onDeleteEntities={onDeleteEntities}
                  onEditEntityShowValue={onEditEntityShowValue}
                  onEditEntity={onEditEntity}
                  onEditEntityValue={onEditEntityValue}
                  onRemoveUserStep={onRemoveUserStep}
                  onCreateBranchStory={onCreateBranchStory}
                />
              );
            }
            if (step.action) {
              return (
                <BotStep
                  key={step.action}
                  isCreate={isCreate}
                  step={{ action, response, buttons }}
                  storyName={newStory.story}
                  onEditBotRes={onEditBotRes}
                  onRemoveBotStep={onRemoveBotStep}
                  onAddResButtons={onAddResButtons}
                  onEditResButtons={onEditResButtons}
                  onRemoveResButton={onRemoveResButton}
                />
              );
            }

            return (
              <CheckPoint
                key={checkpoint}
                isCreate={isCreate}
                branch={branchStories}
                onDeleteBranchStory={onDeleteBranchStory}
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
        {CurStepAlert}
      </div>
      <StepControl
        isUser={isUser}
        hasBranch={hasBranch}
        nlu={nlu}
        steps={newStory.steps}
        actions={actions}
        onSetIsInputFocus={setIsInputFocus}
      />
    </div>
  );
};

export default React.memo(CreateStory);
