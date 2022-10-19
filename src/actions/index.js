import type { TrainDataType, StoryType } from 'components/types';

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
      payload: { intent: string, examples: string, storyName: string },
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
  intent: string,
  examples: string,
  storyName: string,
): Action => ({
  type: 'EDIT_EXAMPLES',
  payload: { intent, examples, storyName },
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
