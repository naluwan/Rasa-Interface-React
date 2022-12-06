import create from 'zustand';

const initialState = {
  newStory: {},
};

const useCreateStoryStore = create(() => {
  return {
    ...initialState,
  };
});

export default useCreateStoryStore;
