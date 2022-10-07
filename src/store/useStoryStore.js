import create from 'zustand';
import {
  getJWTToken,
  verifyToken,
  cleanToken,
  fetchLogin,
  fetchRegister,
} from 'services/api';
import type {
  RegisterUserInfoType,
  TrainDataType,
  State,
} from 'components/types';

import type { Action } from 'actions';
import { actionSetAllData, actionSetStory, actionEditExamples } from 'actions';
// import { computed } from 'zustand-middleware-computed-state';
import swal from 'sweetalert2';

const initialState = {
  isAppInitializedComplete: false,
  user: null,
  loading: false,
  stories: [],
  story: {},
  nlu: {},
  domain: {},
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ALL_TRAIN_DATA': {
      if (action.payload) {
        return {
          ...state,
          ...action.payload,
        };
      }
      return {
        ...state,
      };
    }
    case 'SET_STORY': {
      const story = state.stories.filter(
        (item) => item.story === action.payload,
      )[0];
      story.steps.map((step) => {
        if (step.action) {
          step.response = JSON.parse(
            JSON.stringify(state.domain.responses[step.action][0].text).replace(
              / \\n/g,
              '\\r',
            ),
          );
        }
        if (step.intent) {
          const examples = state.nlu.rasa_nlu_data.common_examples.filter(
            (nluItem) =>
              nluItem.intent === step.intent && nluItem.text !== step.intent,
          );

          const currentExample = examples.map((example) => example.text);
          step.examples = currentExample;
        }
        return step;
      });
      return {
        ...state,
        story,
      };
    }
    case 'EDIT_EXAMPLES': {
      const { intent, examples } = action.payload;
      const currentExamples = examples
        .split(',')
        .map((example) => example.trimStart())
        .map((example) => example.trimEnd())
        .filter((example) => example !== '');
      const nlu = { rasa_nlu_data: { common_examples: [] } };
      nlu.rasa_nlu_data.common_examples =
        state.nlu.rasa_nlu_data.common_examples.filter(
          (nluItem) => nluItem.intent !== intent || nluItem.text === intent,
        );
      const repeat = [];
      currentExamples.map((example) => {
        return nlu.rasa_nlu_data.common_examples.map((nluItem) => {
          if (example === nluItem.text) {
            repeat.push(example);
          }
          return nluItem;
        });
      });
      if (repeat.length) {
        return swal.fire({
          icon: 'warning',
          title: '例句重複，請重新嘗試',
        });
      }
      currentExamples.map((example) => {
        return nlu.rasa_nlu_data.common_examples.push({
          text: example,
          intent,
          entities: [],
        });
      });
      const stepIdx = state.story.steps
        .map((step) => step.intent)
        .indexOf(intent);
      const { story } = state;
      story.steps[stepIdx].examples = currentExamples.toString();
      return {
        ...state,
        nlu,
        story,
      };
    }
    default:
      return state;
  }
};

const useStoryStore = create((set) => {
  const dispatch = (action: Action) => {
    set((state) => {
      return reducer(state, action);
    });
  };
  return {
    ...initialState,
    dispatch,
    // --------------------------- Action
    init() {
      const token = getJWTToken();
      if (token) {
        verifyToken(token)
          .then((user) => {
            set({ user, isAppInitializedComplete: true });
          })
          .catch(() => {});
      } else {
        set({ isAppInitializedComplete: true });
      }
    },
    onLogin(email: string, password: string) {
      set({ loading: true });
      return fetchLogin(email, password).then((res) => {
        set({ user: res.user, loading: false });
        return res;
      });
    },
    onLogout() {
      cleanToken();
      window.location.reload();
    },
    onRegister(userInfo: RegisterUserInfoType) {
      set({ loading: true });
      return fetchRegister(userInfo)
        .then((res) => {
          set({ loading: false });
          return res;
        })
        .catch((err) => console.log(err));
    },
    onSetAllTrainData(data: TrainDataType) {
      dispatch(actionSetAllData(data));
    },
    onSetStory(storyName: string) {
      dispatch(actionSetStory(storyName));
    },
    onEditExamples(intent: string, examples: string) {
      dispatch(actionEditExamples(intent, examples));
    },
  };
});

export default useStoryStore;
