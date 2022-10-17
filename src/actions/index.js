import type { TrainDataType, StoryType } from 'components/types';

export type Action =
  | { type: 'SET_STORY', payload: string }
  | { type: 'SET_ALL_TRAIN_DATA', payload: TrainDataType }
  | { type: 'CREATE_NEW_STORY', payload: StoryType }
  | {
      type: 'EDIT_USER_SAY',
      payload: { oriWord: string, newWord: string, storyName: string },
    };

export const actionSetAllData = (data: TrainDataType) => ({
  type: 'SET_ALL_TRAIN_DATA',
  payload: data,
});

export const actionSetStory = (storyName: string): Action => ({
  type: 'SET_STORY',
  payload: storyName,
});

export const actionCreateNewStory = (newStory: StoryType) => ({
  type: 'CREATE_NEW_STORY',
  payload: newStory,
});

export const actionEditUserSay = (
  oriWord: string,
  newWord: string,
  storyName: string,
) => ({
  type: 'EDIT_USER_SAY',
  payload: { oriWord, newWord, storyName },
});
