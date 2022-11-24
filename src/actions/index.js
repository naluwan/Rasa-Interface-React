import type {
  TrainDataType,
  StoryType,
  NluEntitiesType,
} from 'components/types';

export type Action =
  | { type: 'SET_STORY', payload: string }
  | { type: 'SET_ALL_TRAIN_DATA', payload: TrainDataType }
  | {
      type: 'EDIT_USER_SAY',
      payload: { oriWord: string, newWord: string, storyName: string },
    }
  | {
      type: 'EDIT_BOT_RESPONSE',
      payload: {
        oriWord: string,
        newWord: string,
        actionName: string,
        storyName: string,
      },
    }
  | {
      type: 'CREATE_EXAMPLE',
      payload: {
        stepIntent: string,
        example: string,
        exampleEntities: NluEntitiesType[],
        storyName: string,
      },
    }
  | {
      type: 'SET_DELETE_STORY',
      payload: StoryType,
    }
  | {
      type: 'SET_ALL_ACTION',
      payload: string[],
    }
  | {
      type: 'EDIT_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        oriPayload: string,
        payload: string,
        reply: string,
        storyName: string,
        buttonActionName: string,
      },
    }
  | {
      type: 'REMOVE_RES_BUTTON',
      payload: {
        actionName: string,
        payload: string,
        storyName: string,
        buttonActionName: string,
        disabled: boolean,
      },
    }
  | {
      type: 'ADD_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        payload: string,
        reply: string,
        storyName: string,
      },
    }
  | { type: 'SET_RASA_TRAIN_STATE', payload: number }
  | {
      type: 'EDIT_INTENT',
      payload: { oriIntent: string, intent: string, storyName: string },
    }
  | {
      type: 'CREATE_ENTITIES',
      payload: { entities: NluEntitiesType, intent: string, storyName: string },
    }
  | {
      type: 'DELETE_ENTITIES',
      payload: { entity: string, intent: string, storyName: string },
    }
  | {
      type: 'EDIT_ENTITY_SHOW_VALUE',
      payload: {
        stepIntent: string,
        currentEntityValue: string,
        newEntityShowValue: string,
        storyName: string,
      },
    }
  | {
      type: 'EDIT_ENTITY',
      payload: {
        stepIntent: string,
        oriEntity: string,
        newEntity: string,
        storyName: string,
      },
    }
  | {
      type: 'EDIT_ENTITY_VALUE',
      payload: {
        stepIntent: string,
        oriEntityValue: string,
        newEntityValue: string,
        storyName: string,
      },
    }
  | {
      type: 'DELETE_EXAMPLE',
      payload: { userSay: string, stepIntent: string, storyName: string },
    }
  | {
      type: 'CREATE_SLOT',
      payload: {
        slotName: string,
        slotType: string,
        slotValues: { name: string, id: string }[],
      },
    }
  | {
      type: 'REMOVE_SLOT',
      payload: string,
    }
  | {
      type: 'ADD_SLOT_VALUE',
      payload: {
        slotValues: {
          slotName: string,
          slotValueItems: { name: string, id: string }[],
        },
      },
    };

export const actionSetAllData = (data: TrainDataType): Action => ({
  type: 'SET_ALL_TRAIN_DATA',
  payload: data,
});

export const actionSetStory = (storyName: string): Action => ({
  type: 'SET_STORY',
  payload: storyName,
});

export const actionEditUserSay = (
  oriWord: string,
  newWord: string,
  storyName: string,
): Action => ({
  type: 'EDIT_USER_SAY',
  payload: { oriWord, newWord, storyName },
});

export const actionEditBotRes = (
  oriWord: string,
  newWord: string,
  actionName: string,
  storyName: string,
): Action => ({
  type: 'EDIT_BOT_RESPONSE',
  payload: { oriWord, newWord, actionName, storyName },
});

export const actionCreateExample = (
  stepIntent: string,
  example: string,
  exampleEntities: NluEntitiesType[],
  storyName: string,
): Action => ({
  type: 'CREATE_EXAMPLE',
  payload: { stepIntent, example, exampleEntities, storyName },
});

export const actionSetDeleteStory = (deleteStory: StoryType): Action => ({
  type: 'SET_DELETE_STORY',
  payload: deleteStory,
});

export const actionSetAllAction = (allAction: string[]): Action => ({
  type: 'SET_ALL_ACTION',
  payload: allAction,
});

export const actionEditResButtons = (
  actionName: string,
  title: string,
  oriPayload: string,
  payload: string,
  reply: string,
  storyName: string,
  buttonActionName: string,
): Action => ({
  type: 'EDIT_RES_BUTTONS',
  payload: {
    actionName,
    title,
    oriPayload,
    payload,
    reply,
    storyName,
    buttonActionName,
  },
});

export const actionRemoveResButton = (
  actionName: string,
  payload: string,
  storyName: string,
  buttonActionName: string,
  disabled: boolean,
): Action => ({
  type: 'REMOVE_RES_BUTTON',
  payload: { actionName, payload, storyName, buttonActionName, disabled },
});

export const actionAddResButtons = (
  actionName: string,
  title: string,
  payload: string,
  reply: string,
  storyName: string,
): Action => ({
  type: 'ADD_RES_BUTTONS',
  payload: { actionName, title, payload, reply, storyName },
});

export const actionSetRasaTrainState = (state: number): Action => ({
  type: 'SET_RASA_TRAIN_STATE',
  payload: state,
});

export const actionEditIntent = (
  oriIntent: string,
  intent: String,
  storyName,
): Action => ({
  type: 'EDIT_INTENT',
  payload: { oriIntent, intent, storyName },
});

export const actionCreateEntities = (
  entities: NluEntitiesType,
  intent: string,
  storyName: string,
): Action => ({
  type: 'CREATE_ENTITIES',
  payload: { entities, intent, storyName },
});

export const actionDeleteEntities = (
  entity: string,
  intent: string,
  storyName: string,
): Action => ({
  type: 'DELETE_ENTITIES',
  payload: { entity, intent, storyName },
});

export const actionEditEntityShowValue = (
  stepIntent: string,
  currentEntityValue: string,
  newEntityShowValue: string,
  storyName: string,
): Action => ({
  type: 'EDIT_ENTITY_SHOW_VALUE',
  payload: { stepIntent, currentEntityValue, newEntityShowValue, storyName },
});

export const actionEditEntity = (
  stepIntent: string,
  oriEntity: string,
  newEntity: string,
  storyName: string,
): Action => ({
  type: 'EDIT_ENTITY',
  payload: { stepIntent, oriEntity, newEntity, storyName },
});

export const actionEditEntityValue = (
  stepIntent: string,
  oriEntityValue: string,
  newEntityValue: string,
  storyName?: string,
): Action => ({
  type: 'EDIT_ENTITY_VALUE',
  payload: { stepIntent, oriEntityValue, newEntityValue, storyName },
});

export const actionDeleteExample = (
  userSay: string,
  stepIntent: string,
  storyName: string,
): ACtion => ({
  type: 'DELETE_EXAMPLE',
  payload: { userSay, stepIntent, storyName },
});

export const actionCreateSlot = (formValue: {
  slotName: string,
  slotType: string,
  slotValues: { name: string, id: string }[],
}): Action => ({
  type: 'CREATE_SLOT',
  payload: formValue,
});

export const actionRemoveSlot = (slotKey: string): Action => ({
  type: 'REMOVE_SLOT',
  payload: slotKey,
});

export const actionAddSlotValue = (slotValues: {
  slotName: string,
  slotValueItems: { name: string, id: string }[],
}): Action => ({
  type: 'ADD_SLOT_VALUE',
  payload: { slotValues },
});
