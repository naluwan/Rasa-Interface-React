import * as React from 'react';
import shallow from 'zustand/shallow';
import UserStep from 'components/UserStep';
import BotStep from 'components/BotStep';
import style from './ShowStory.module.scss';
import type { StoryType, State } from '../types';
import useStoryStore from '../../store/useStoryStore';
// import StepControl from '../CreateStory/StepControl';
import CheckPoint from '../CheckPoint';

type ShowStoryProps = {
  story: StoryType,
  isCreate: boolean,
  onDeleteStory: (storyName: string) => void,
};

const ShowStory: React.FC<ShowStoryProps> = (props) => {
  const { story, isCreate, onDeleteStory } = props;
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
    };
  }, shallow);

  return (
    <div data-showstory className={style.root}>
      <div className="col d-flex align-items-center">
        <div className={style.title}>{story.story}</div>
        {story.story !== '問候語' && (
          <button
            type="button"
            className="btn btn-danger mx-4"
            onClick={() => onDeleteStory(story.story)}
          >
            刪除故事
          </button>
        )}
      </div>
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
            />
          );
        })}
        {/* <StepControl /> */}
      </div>
    </div>
  );
};

export default React.memo(ShowStory);
