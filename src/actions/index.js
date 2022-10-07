import type { TrainDataType } from 'components/types';

export type Action =
  | { type: 'SET_STORY', payload: string }
  | { type: 'SET_ALL_TRAIN_DATA', payload: TrainDataType }
  | {
      type: 'EDIT_EXAMPLES',
      payload: { intent: string, examples: string, step: strin },
    };

export const actionSetAllData = (data: TrainDataType) => ({
  type: 'SET_ALL_TRAIN_DATA',
  payload: data,
});

export const actionSetStory = (storyName: string): Action => ({
  type: 'SET_STORY',
  payload: storyName,
});

export const actionEditExamples = (
  intent: string,
  examples: string,
): Action => ({
  type: 'EDIT_EXAMPLES',
  payload: { intent, examples },
});
