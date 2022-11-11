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
      type: 'EDIT_EXAMPLES',
      payload: {
        userSay: string,
        intent: string,
        examples: string,
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

export const actionEditExamples = (
  userSay: string,
  intent: string,
  examples: string,
  storyName: string,
): Action => ({
  type: 'EDIT_EXAMPLES',
  payload: { userSay, intent, examples, storyName },
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
