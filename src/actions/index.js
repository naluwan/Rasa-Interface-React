import type {
  TrainDataType,
  StoryType,
  NluEntitiesType,
  NluType,
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
    }
  | {
      type: 'REMOVE_SLOT_VALUE',
      payload: {
        key: string,
        value: string,
      },
    }
  | {
      type: 'CREATE_STORY_EDIT_USER_SAY',
      payload: {
        oriUserSay: string,
        userSay: string,
        storyName: string,
        nlu: NluType,
      },
    }
  | {
      type: 'CREATE_STORY_USER_STEP',
      payload: string,
    }
  | {
      type: 'CREATE_NEW_STORY',
      payload: StoryType,
    }
  | {
      type: 'CREATE_STORY_EDIT_INTENT',
      payload: {
        oriIntent: string,
        intent: string,
        storyName: string,
        nlu: NluType,
      },
    }
  | {
      type: 'CREATE_STORY_CREATE_EXAMPLE',
      payload: {
        intent: string,
        example: string,
        exampleEntities: NluEntitiesType[],
        storyName: string,
        nlu: NluType,
      },
    }
  | {
      type: 'CREATE_STORY_DELETE_EXAMPLE',
      payload: { userSay: string, intent: string },
    }
  | {
      type: 'CREATE_STORY_CREATE_ENTITIES',
      payload: { entities: NluEntitiesType, intent: string },
    }
  | {
      type: 'CREATE_STORY_DELETE_ENTITIES',
      payload: { entity: string, intent: string },
    }
  | {
      type: 'CREATE_STORY_EDIT_ENTITY_SHOW_VALUE',
      payload: {
        stepIntent: string,
        entityValue: string,
        newEntityShowValue: string,
      },
    }
  | {
      type: 'CREATE_STORY_EDIT_ENTITY',
      payload: { stepIntent: string, oriEntity: string, newEntity: string },
    }
  | {
      type: 'CREATE_STORY_EDIT_ENTITY_VALUE',
      payload: {
        stepIntent: string,
        oriEntityValue: string,
        newEntityValue: string,
      },
    }
  | {
      type: 'CREATE_STORY_CREATE_BOT_STEP',
      payload: { actionName: string, botRes: string },
    }
  | {
      type: 'CREATE_STORY_EDIT_BOT_RES',
      payload: { oriBotRes: string, botRes: string, actionName: string },
    }
  | {
      type: 'CREATE_STORY_REMOVE_USER_STEP',
      payload: { intent: string, userSay: string },
    }
  | {
      type: 'CREATE_STORY_REMOVE_BOT_STEP',
      payload: string,
    }
  | {
      type: 'CREATE_STORY_ADD_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        payload: string,
        reply: string,
        storyName: string,
        stories: StoryType[],
      },
    }
  | {
      type: 'CREATE_STORY_EDIT_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        oriPayload: string,
        payload: string,
        reply: string,
        storyName: string,
        buttonActionName: string,
        stories: StoryType[],
      },
    }
  | {
      type: 'CREATE_STORY_REMOVE_RES_BUTTON',
      payload: { actionName: string, payload: string },
    }
  | {
      type: 'CREATE_STORY_CREATE_BRANCH_STORY',
      payload: {
        branchName: string,
        slotValues: {
          slotName: string,
          slotValue: string,
          id: string,
          hasSlotValues: boolean,
        }[],
        botRes: { action: string, response: string },
      },
    }
  | {
      type: 'CREATE_STORY_DELETE_BRANCH_STORY',
      payload: { checkPointName: string, branchName: string },
    }
  | {
      type: 'CHECK_POINT_CONNECT_BRANCH_STORY',
      payload: {
        newStory: StoryType,
        newBranchStory: {
          branchName: string,
          slotValues: {
            slotName: string,
            slotValue: string,
            id: string,
            hasSlotValues: boolean,
          }[],
          botRes?: { action: string, response: string },
        },
      },
    }
  | {
      type: 'CHECK_POINT_DELETE_CONNECT_BRANCH_STORY',
      payload: { checkPointName: string, branchName: string },
    }
  | {
      type: 'CREATE_STORY_BRANCH_STORY_EDIT_BOT_RES',
      payload: {
        oriBotRes: string,
        botRes: string,
        actionName: string,
        storyName: string,
        checkPointName: string,
      },
    }
  | {
      type: 'CREATE_STORY_CONNECT_STORY_EDIT_BOT_RES',
      payload: {
        oriBotRes: string,
        botRes: string,
        actionName: string,
        storyName: string,
        checkPointName: String,
        connectStoryName: string,
      },
    }
  | {
      type: 'CREATE_STORY_BRANCH_STORY_ADD_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        payload: string,
        reply: string,
        storyName: string,
        stories: StoryType[],
        checkPointName: string,
      },
    }
  | {
      type: 'CREATE_STORY_BRANCH_STORY_REMOVE_RES_BUTTON',
      payload: {
        actionName: string,
        payload: string,
        storyName?: string,
        buttonActionName?: string,
        disabled?: string,
        checkPointName: string,
      },
    }
  | {
      type: 'CREATE_STORY_BRANCH_STORY_EDIT_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        oriPayload: string,
        payload: string,
        reply: string,
        storyName: string,
        buttonActionName: string,
        stories: StoryType[],
        checkPointName: string,
      },
    }
  | {
      type: 'CREATE_STORY_CONNECT_STORY_ADD_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        payload: string,
        reply: string,
        storyName: string,
        stories: StoryType[],
        checkPointName: string,
        connectStoryName: string,
      },
    }
  | {
      type: 'CREATE_STORY_CONNECT_STORY_REMOVE_RES_BUTTON',
      payload: {
        actionName: string,
        payload: string,
        storyName: string,
        buttonActionName: string,
        disabled: boolean,
        checkPointName: string,
        connectStoryName: string,
      },
    }
  | {
      type: 'CREATE_STORY_CONNECT_STORY_EDIT_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        oriPayload: string,
        payload: string,
        reply: string,
        storyName: string,
        buttonActionName: string,
        stories: StoryType[],
        checkPointName: string,
        connectStoryName: string,
      },
    }
  | {
      type: 'ADD_BRANCH_STORY',
      payload: {
        storyName: string,
        newBranchStory: {
          branchName: string,
          slotValues: {
            slotName: string,
            slotValue: string,
            id: string,
            hasSlotValues: boolean,
          }[],
          botRes?: { action: string, response: string },
        },
      },
    }
  | {
      type: 'REMOVE_BRANCH_STORY',
      payload: { checkPointName: string, storyName: string },
    }
  | {
      type: 'ADD_CONNECT_STORY',
      payload: {
        storyName: string,
        branchStoryName: string,
        newBranchStory: {
          branchName: string,
          slotValues: {
            slotName: string,
            slotValue: string,
            id: string,
            hasSlotValues: boolean,
          }[],
          botRes?: { action: string, response: string },
        },
      },
    }
  | {
      type: 'REMOVE_CONNECT_STORY',
      payload: { checkPointName: string, storyName: string },
    }
  | {
      type: 'EDIT_BRANCH_STORY_BOT_RES',
      payload: {
        oriBotRes: string,
        botRes: string,
        actionName: string,
        storyName: string,
        checkPointName: string,
      },
    }
  | {
      type: 'EDIT_CONNECT_STORY_BOT_RES',
      payload: {
        oriBotRes: string,
        botRes: string,
        actionName: string,
        storyName: string,
        checkPointName: String,
        connectStoryName: string,
      },
    }
  | {
      type: 'BRANCH_STORY_ADD_BOT_RES',
      payload: {
        actionName: string,
        title: string,
        payload: string,
        reply: string,
        storyName: string,
        storiesData: StoryType[],
        checkPointName: string,
      },
    }
  | {
      type: 'BRANCH_STORY_REMOVE_RES_BUTTON',
      payload: {
        actionName: string,
        payload: string,
        storyName: string,
        buttonActionName: string,
        disabled: boolean,
        checkPointName: string,
      },
    }
  | {
      type: 'BRANCH_STORY_EDIT_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        oriPayload: string,
        payload: string,
        reply: string,
        storyName: string,
        buttonActionName: string,
        stories: StoryType[],
        checkPointName: string,
      },
    }
  | {
      type: 'CONNECT_STORY_ADD_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        payload: string,
        reply: string,
        storyName: string,
        storiesData: StoryType[],
        checkPointName: string,
        connectStoryName: string,
      },
    }
  | {
      type: 'CONNECT_STORY_REMOVE_RES_BUTTON',
      payload: {
        actionName: string,
        payload: string,
        storyName: string,
        buttonActionName: string,
        disabled: boolean,
        checkPointName: string,
        connectStoryName: string,
      },
    }
  | {
      type: 'CONNECT_STORY_EDIT_RES_BUTTONS',
      payload: {
        actionName: string,
        title: string,
        oriPayload: string,
        payload: string,
        reply: string,
        storyName: string,
        buttonActionName: string,
        stories: StoryType[],
        checkPointName: string,
        connectStoryName: string,
      },
    }
  | {
      type: 'SELECT_CATEGORY',
      payload: string,
    }
  | {
      type: 'SELECTED_STORY',
      payload: straing,
    }
  | {
      type: 'EDIT_STORY_INFO',
      payload: {
        ori: { story: string, category: string },
        new: { story: string, category: string, create?: boolean },
      },
    };

// ====================== query story ======================

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

export const actionRemoveSlotValue = (slotValue: {
  key: string,
  value: string,
}): Action => ({
  type: 'REMOVE_SLOT_VALUE',
  payload: slotValue,
});

export const actionAddBranchStory = (
  storyName: string,
  newBranchStory: {
    branchName: string,
    slotValues: {
      slotName: string,
      slotValue: string,
      id: string,
      hasSlotValues: boolean,
    }[],
    botRes?: { action: string, response: string },
  },
): Action => ({
  type: 'ADD_BRANCH_STORY',
  payload: { storyName, newBranchStory },
});

export const actionRemoveBranchStory = (
  checkPointName: string,
  storyName: string,
): Action => ({
  type: 'REMOVE_BRANCH_STORY',
  payload: { checkPointName, storyName },
});

export const actionAddConnectStory = (
  storyName: string,
  branchStoryName: string,
  newBranchStory: {
    branchName: string,
    slotValues: {
      slotName: string,
      slotValue: string,
      id: string,
      hasSlotValues: boolean,
    }[],
    botRes?: { action: string, response: string },
  },
): Action => ({
  type: 'ADD_CONNECT_STORY',
  payload: { storyName, branchStoryName, newBranchStory },
});

export const actionRemoveConnectStory = (
  checkPointName: string,
  storyName: string,
): Action => ({
  type: 'REMOVE_CONNECT_STORY',
  payload: { checkPointName, storyName },
});

export const actionEditBranchStoryBotRes = (
  oriBotRes: string,
  botRes: string,
  actionName: string,
  storyName: string,
  checkPointName: string,
): Action => ({
  type: 'EDIT_BRANCH_STORY_BOT_RES',
  payload: { oriBotRes, botRes, actionName, storyName, checkPointName },
});

export const actionEditConnectStoryBotRes = (
  oriBotRes: string,
  botRes: string,
  actionName: string,
  storyName: string,
  checkPointName: String,
  connectStoryName: string,
): Action => ({
  type: 'EDIT_CONNECT_STORY_BOT_RES',
  payload: {
    oriBotRes,
    botRes,
    actionName,
    storyName,
    checkPointName,
    connectStoryName,
  },
});

export const actionBranchStoryAddResButtons = (
  actionName: string,
  title: string,
  payload: string,
  reply: string,
  storyName: string,
  storiesData: StoryType[],
  checkPointName: string,
): Action => ({
  type: 'BRANCH_STORY_ADD_RES_BUTTONS',
  payload: {
    actionName,
    title,
    payload,
    reply,
    storyName,
    storiesData,
    checkPointName,
  },
});

export const actionBranchStoryRemoveResButton = (
  actionName: string,
  payload: string,
  storyName: string,
  buttonActionName: string,
  disabled: boolean,
  checkPointName: string,
): Action => ({
  type: 'BRANCH_STORY_REMOVE_RES_BUTTON',
  payload: {
    actionName,
    payload,
    storyName,
    buttonActionName,
    disabled,
    checkPointName,
  },
});

export const actionBranchStoryEditResButtons = (
  actionName: string,
  title: string,
  oriPayload: string,
  payload: string,
  reply: string,
  storyName: string,
  buttonActionName: string,
  stories: StoryType[],
  checkPointName: string,
): Action => ({
  type: 'BRANCH_STORY_EDIT_RES_BUTTONS',
  payload: {
    actionName,
    title,
    oriPayload,
    payload,
    reply,
    storyName,
    buttonActionName,
    stories,
    checkPointName,
  },
});

export const actionConnectStoryAddResButtons = (
  actionName: string,
  title: string,
  payload: string,
  reply: string,
  storyName: string,
  storiesData: StoryType[],
  checkPointName: string,
  connectStoryName: string,
): Action => ({
  type: 'CONNECT_STORY_ADD_RES_BUTTONS',
  payload: {
    actionName,
    title,
    payload,
    reply,
    storyName,
    storiesData,
    checkPointName,
    connectStoryName,
  },
});

export const actionConnectStoryRemoveResButton = (
  actionName: string,
  payload: string,
  storyName: string,
  buttonActionName: string,
  disabled: boolean,
  checkPointName: string,
  connectStoryName: string,
): Action => ({
  type: 'CONNECT_STORY_REMOVE_RES_BUTTON',
  payload: {
    actionName,
    payload,
    storyName,
    buttonActionName,
    disabled,
    checkPointName,
    connectStoryName,
  },
});

export const actionConnectStoryEditResButtons = (
  actionName: string,
  title: string,
  oriPayload: string,
  payload: string,
  reply: string,
  storyName: string,
  buttonActionName: string,
  stories: StoryType[],
  checkPointName: string,
  connectStoryName: string,
): Action => ({
  type: 'CONNECT_STORY_EDIT_RES_BUTTONS',
  payload: {
    actionName,
    title,
    oriPayload,
    payload,
    reply,
    storyName,
    buttonActionName,
    stories,
    checkPointName,
    connectStoryName,
  },
});

export const actionSelectedCategory = (categoryName: string): Action => ({
  type: 'SELECTED_CATEGORY',
  payload: categoryName,
});

export const actionSelectedStory = (storyName: string): Action => ({
  type: 'SELECTED_STORY',
  payload: storyName,
});

export const actionEditStoryInfo = (storyInfo: {
  ori: { story: string, category: string },
  new: { story: string, category: string, create?: boolean },
}): Action => ({
  type: 'EDIT_STORY_INFO',
  payload: storyInfo,
});

// ====================== create story ======================

export const actionCreateNewStory = (newStoryInfo: StoryType): Action => ({
  type: 'CREATE_NEW_STORY',
  payload: newStoryInfo,
});

export const actionCreateStoryCreateUserStep = (userSay: string): Action => ({
  type: 'CREATE_STORY_CREATE_USER_STEP',
  payload: userSay,
});

export const actionCreateStoryEditUserSay = (
  oriUserSay: string,
  userSay: string,
  storyName: string,
  nlu: NluType,
): Action => ({
  type: 'CREATE_STORY_EDIT_USER_SAY',
  payload: { oriUserSay, userSay, storyName, nlu },
});

export const actionCreateStoryEditIntent = (
  oriIntent: string,
  intent: string,
  storyName: string,
  nlu: NluType,
): Action => ({
  type: 'CREATE_STORY_EDIT_INTENT',
  payload: { oriIntent, intent, storyName, nlu },
});

export const actionCreateStoryCreateExample = (
  intent: string,
  example: string,
  exampleEntities: NluEntitiesType[],
  storyName: string,
  nlu: NluType,
): Action => ({
  type: 'CREATE_STORY_CREATE_EXAMPLE',
  payload: { intent, example, exampleEntities, storyName, nlu },
});

export const actionCreateStoryDeleteExample = (
  userSay: string,
  intent: string,
): Action => ({
  type: 'CREATE_STORY_DELETE_EXAMPLE',
  payload: { userSay, intent },
});

export const actionCreateStoryCreateEntities = (
  entities: NluEntitiesType,
  intent: string,
): Action => ({
  type: 'CREATE_STORY_CREATE_ENTITIES',
  payload: { entities, intent },
});

export const actionCreateStoryDeleteEntities = (
  entity: string,
  intent: string,
): Action => ({
  type: 'CREATE_STORY_DELETE_ENTITIES',
  payload: { entity, intent },
});

export const actionCreateStoryEditEntityShowValue = (
  stepIntent: string,
  entityValue: string,
  newEntityShowValue: string,
): Action => ({
  type: 'CREATE_STORY_EDIT_ENTITY_SHOW_VALUE',
  payload: { stepIntent, entityValue, newEntityShowValue },
});

export const actionCreateStoryEditEntity = (
  stepIntent: string,
  oriEntity: string,
  newEntity: string,
): Action => ({
  type: 'CREATE_STORY_EDIT_ENTITY',
  payload: { stepIntent, oriEntity, newEntity },
});

export const actionCreateStoryEditEntityValue = (
  stepIntent: string,
  oriEntityValue: string,
  newEntityValue: string,
): Action => ({
  type: 'CREATE_STORY_EDIT_ENTITY_VALUE',
  payload: { stepIntent, oriEntityValue, newEntityValue },
});

export const actionCreateStoryCreateBotStep = (
  actionName: string,
  botRes: string,
): Action => ({
  type: 'CREATE_STORY_CREATE_BOT_STEP',
  payload: { actionName, botRes },
});

export const actionCreateStoryEditBotRes = (
  oriBotRes: string,
  botRes: string,
  actionName: string,
): Action => ({
  type: 'CREATE_STORY_EDIT_BOT_RES',
  payload: { oriBotRes, botRes, actionName },
});

export const actionCreateStoryRemoveUserStep = (
  intent: string,
  userSay: string,
): Action => ({
  type: 'CREATE_STORY_REMOVE_USER_STEP',
  payload: { intent, userSay },
});

export const actionCreateStoryRemoveBotStep = (actionName: string): Action => ({
  type: 'CREATE_STORY_REMOVE_BOT_STEP',
  payload: actionName,
});

export const actionCreateStoryAddResButtons = (
  actionName: string,
  title: string,
  payload: string,
  reply: string,
  storyName: string,
  stories: StoryType[],
): Action => ({
  type: 'CREATE_STORY_ADD_RES_BUTTONS',
  payload: { actionName, title, payload, reply, storyName, stories },
});

export const actionCreateStoryEditResButtons = (
  actionName: string,
  title: string,
  oriPayload: string,
  payload: string,
  reply: string,
  storyName: string,
  buttonActionName: string,
  stories: StoryType[],
): Action => ({
  type: 'CREATE_STORY_EDIT_RES_BUTTONS',
  payload: {
    actionName,
    title,
    oriPayload,
    payload,
    reply,
    storyName,
    buttonActionName,
    stories,
  },
});

export const actionCreateRemoveResButton = (
  actionName: string,
  payload: string,
): Action => ({
  type: 'CREATE_STORY_REMOVE_RES_BUTTON',
  payload: { actionName, payload },
});

export const actionCreateStoryCreateBranchStory = (newBranchStory: {
  branchName: string,
  slotValues: {
    slotName: string,
    slotValue: string,
    id: string,
    hasSlotValues: boolean,
  }[],
  botRes?: { action: string, response: string },
}): Action => ({
  type: 'CREATE_STORY_CREATE_BRANCH_STORY',
  payload: newBranchStory,
});

export const actionCreateStoryDeleteBranchStory = (
  checkPointName: string,
  branchName: string,
): Action => ({
  type: 'CREATE_STORY_DELETE_BRANCH_STORY',
  payload: { checkPointName, branchName },
});

// ====================== checkpoint ======================

export const actionCheckPointConnectBranchStory = (
  newStory: StoryType,
  newBranchStory: {
    branchName: string,
    slotValues: {
      slotName: string,
      slotValue: string,
      id: string,
      hasSlotValues: boolean,
    }[],
    botRes?: { action: string, response: string },
  },
): Action => ({
  type: 'CHECK_POINT_CONNECT_BRANCH_STORY',
  payload: { newStory, newBranchStory },
});

export const actionCheckPointDeleteConnectBranchStory = (
  checkPointName: string,
  branchName: string,
): Action => ({
  type: 'CHECK_POINT_DELETE_CONNECT_BRANCH_STORY',
  payload: { checkPointName, branchName },
});

export const actionCreateStoryBranchStoryEditBotRes = (
  oriBotRes: string,
  botRes: string,
  actionName: string,
  storyName: string,
  checkPointName: string,
): Action => ({
  type: 'CREATE_STORY_BRANCH_STORY_EDIT_BOT_RES',
  payload: { oriBotRes, botRes, actionName, storyName, checkPointName },
});

export const actionCreateStoryConnectStoryEditBotRes = (
  oriBotRes: string,
  botRes: string,
  actionName: string,
  storyName: string,
  checkPointName: String,
  connectStoryName: string,
): Action => ({
  type: 'CREATE_STORY_CONNECT_STORY_EDIT_BOT_RES',
  payload: {
    oriBotRes,
    botRes,
    actionName,
    storyName,
    checkPointName,
    connectStoryName,
  },
});

export const actionCreateStoryBranchStoryAddResButtons = (
  actionName: string,
  title: string,
  payload: string,
  reply: string,
  storyName: string,
  stories: StoryType[],
  checkPointName: string,
): Action => ({
  type: 'CREATE_STORY_BRANCH_STORY_ADD_RES_BUTTONS',
  payload: {
    actionName,
    title,
    payload,
    reply,
    storyName,
    stories,
    checkPointName,
  },
});

export const actionCreateStoryBranchStoryRemoveResButton = (
  actionName: string,
  payload: string,
  storyName: string,
  buttonActionName: string,
  disabled: boolean,
  checkPointName: string,
): Action => ({
  type: 'CREATE_STORY_BRANCH_STORY_REMOVE_RES_BUTTON',
  payload: {
    actionName,
    payload,
    storyName,
    buttonActionName,
    disabled,
    checkPointName,
  },
});

export const actionCreateStoryBranchStoryEditResButtons = (
  actionName: string,
  title: string,
  oriPayload: string,
  payload: string,
  reply: string,
  storyName: string,
  buttonActionName: string,
  stories: StoryType[],
  checkPointName: string,
): Action => ({
  type: 'CREATE_STORY_BRANCH_STORY_EDIT_RES_BUTTONS',
  payload: {
    actionName,
    title,
    oriPayload,
    payload,
    reply,
    storyName,
    buttonActionName,
    stories,
    checkPointName,
  },
});

export const actionCreateStoryConnectStoryAddResButtons = (
  actionName: string,
  title: string,
  payload: string,
  reply: string,
  storyName: string,
  stories: StoryType[],
  checkPointName: string,
  connectStoryName: string,
): Action => ({
  type: 'CREATE_STORY_CONNECT_STORY_ADD_RES_BUTTONS',
  payload: {
    actionName,
    title,
    payload,
    reply,
    storyName,
    stories,
    checkPointName,
    connectStoryName,
  },
});

export const actionCreateStoryConnectStoryRemoveResButton = (
  actionName: string,
  payload: string,
  storyName: string,
  buttonActionName: string,
  disabled: boolean,
  checkPointName: string,
  connectStoryName: string,
): Action => ({
  type: 'CREATE_STORY_CONNECT_STORY_REMOVE_RES_BUTTON',
  payload: {
    actionName,
    payload,
    storyName,
    buttonActionName,
    disabled,
    checkPointName,
    connectStoryName,
  },
});

export const actionCreateStoryConnectStoryEditResButtons = (
  actionName: string,
  title: string,
  oriPayload: string,
  payload: string,
  reply: string,
  storyName: string,
  buttonActionName: string,
  stories: StoryType[],
  checkPointName: string,
  connectStoryName: string,
): Action => ({
  type: 'CREATE_STORY_CONNECT_STORY_EDIT_RES_BUTTONS',
  payload: {
    actionName,
    title,
    oriPayload,
    payload,
    reply,
    storyName,
    buttonActionName,
    stories,
    checkPointName,
    connectStoryName,
  },
});
