export type NavItemType = {
  id: number,
  name: string,
  link: string,
};

export type UserInfo = {
  id: number,
  cpnyId: string,
  cpnyName: string,
  chatbotName: string,
  image: string,
  email: string,
  isAdmin: number,
  role: object,
  createdAt: string,
  updatedAt: string,
};

export type RegisterUserInfoType = {
  cpnyId: string,
  cpnyName: string,
  chatbotName: string,
  email: string,
  password: string,
  passwordCheck: string,
  image: fileList,
};

export type EntitiesType = {
  [entitiesKey: string]: string,
};

export type NluEntitiesType = {
  start: number,
  end: number,
  value: string,
  entity: string,
};

export type StepsType =
  | {
      intent: string,
      user: string,
      entities: EntitiesType[] | [],
      checkpoint?: string,
      examples?: string[] | [],
    }
  | { action: string, response?: string }
  | {
      checkpoint: string,
      branchStories?: { story: String, steps: StepsType[] }[],
      slot_was_set?: { [key: string]: string }[],
      action?: string,
      response?: string,
    };

export type StoryType = {
  story: string,
  steps: StepsType[],
};

export type ResponseType = {
  [action_key: string]: [{ text: string }],
};

export type DomainType = {
  actions: string[],
  entities: string[],
  form: object,
  intents: string[],
  responses: ResponseType,
  slots: { [key: string]: { type: String, values?: string[] } },
};

export type ExampleEntitiesType = {
  entity: string,
  value: string,
  start: number,
  end: number,
};
export type ExampleType = {
  text: string,
  intent: sting,
  entities: ExampleEntitiesType[],
};

export type NluType = {
  rasa_nlu_data: { common_examples: ExampleType[] },
};

export type TrainDataType = {
  stories: StoryType[],
  nlu: NluType,
  domain: DomainType,
};

export type ApiTrainDataType = {
  stories: string,
  nlu: NluType,
  domain: string,
  config: string,
};

export type State = {
  isAppInitializedComplete: boolean,
  user: UserInfo,
  loading: boolean,
  stories: StoryType[],
  domain: DomainType,
  nlu: NluType,
  story: StoryType,
  cloneData: TrainDataType,
  deletedStory: StoryType,
  actions: string[],
  storiesOptions: StoryType[],
  rasaTrainState: number,
  currentPage: string,
  // actions
  init: () => void,
  trainRasa: (currentData: ApiTrainDataType) => void,
  onLogin: (email: string, password: string) => void,
  onLogout: () => void,
  onRegister: (userInfo: RegisterUserInfoType) => void,
  onSetCurrentPage: (pageName: string) => void,
  onSetAllTrainData: (data: TrainDataType) => void,
  onSetStory: (storyName: string) => void,
  onSetDeleteStory: (deleteStory: StoryType) => void,
  onEditUserSay: (oriWord: string, newWord: string, storyName: string) => void,
  onEditBotRes: (
    oreWord: string,
    newWord: string,
    actionName: string,
    storyName: string,
  ) => void,
  onCreateExample: (
    intent: string,
    examples: string,
    exampleEntities: NluEntitiesType[],
    storyName: string,
  ) => void,
  onSetAllAction: (action: string[]) => void,
  onEditResButtons: (
    actionName: string,
    title: string,
    oriPayload: string,
    payload: string,
    reply: string,
    storyName: string,
    buttonActionName: string,
  ) => void,
  onRemoveResButton: (
    actionName: string,
    payload: string,
    storyName: string,
    buttonActionName: string,
    disabled: boolean,
  ) => void,
  onAddResButtons: (
    actionName: string,
    title: string,
    payload: string,
    reply: string,
    storyName: string,
  ) => void,
  onEditIntent: (oriIntent: string, intent: string, storyName: string) => void,
  onSetRasaTrainState: (state: number) => void,
  onCreateEntities: (
    entities: NluEntitiesType,
    intent: string,
    storyName: string,
  ) => void,
  onDeleteEntities: (entity: string, intent: string, storyName: string) => void,
  onEditEntityShowValue: (
    stepIntent: string,
    currentEntityValue: string,
    newEntityShowValue: string,
    storyName: string,
  ) => void,
  onEditEntity: (
    stepIntent: string,
    oriEntity: string,
    newEntity: string,
    storyName: string,
  ) => void,
  onEditEntityValue: (
    stepIntent: string,
    oriEntityValue: string,
    newEntityValue: string,
    storyName: string,
  ) => void,
  onDeleteExample: (
    userSay: string,
    stepIntent: string,
    storyName: string,
  ) => void,
};

export type CreateStoryState = {
  newStory: StoryType,
  currentStep: string,
  checkPointName: string,
  selectedBranchStory: StoryType,
  selectedConnectBranchStory: StoryType,
  // 初始化新故事
  onInitialNewStory: () => void,
  // 設定新增支線故事彈跳窗是在支線故事內點擊
  onSetBranchStep: () => void,
  // 設定新增支線故事彈跳窗是在正常流程點擊
  onSetMainStep: () => void,
  // 設定目前的支線故事名稱
  onSetCheckPointName: (checkPointName: string) => void,
  // 設定目前選擇的支線故事
  onSetSelectedBranchStory: (selectedBranchStory: StoryType) => void,
  // 設定目前支線故事內串接的支線故事
  onSetSelectedConnectBranchStory: (
    selectedConnectBranchStory: StoryType,
  ) => void,
  // 建立新故事
  onCreateNewStory: (storyName: string) => void,
  // 新增使用者步驟
  onCreateUserStep: (userSay: string) => void,
  // 編輯使用者對話
  onEditUserSay: (
    oriUserSay: string,
    userSay: string,
    storyName: string,
    nlu: NluType,
  ) => void,
  // 編輯意圖
  onEditIntent: (
    oriIntent: string,
    intent: string,
    storyName: string,
    nlu: NluType,
  ) => void,
  // 新增例句
  onCreateExample: (
    intent: string,
    example: string,
    exampleEntities: NluEntitiesType[],
    storyName: string,
    nlu: NluType,
  ) => void,
  // 刪除例句
  onDeleteExample: (userSay: String, intent: string) => void,
  // 新增關鍵字
  onCreateEntities: (entities: NluEntitiesType, intent: string) => void,
  // 刪除關鍵字
  onDeleteEntities: (entity: string, intent: string) => void,
  // 編輯關鍵字位置
  onEditEntityShowValue: (
    stepIntent: string,
    entityValue: string,
    newEntityShowValue: string,
  ) => void,
  // 編輯關鍵字
  onEditEntity: (
    stepIntent: string,
    oriEntity: string,
    newEntity: string,
  ) => void,
  // 編輯關鍵字代表值(儲存槽值)
  onEditEntityValue: (
    stepIntent: string,
    oriEntityValue: string,
    newEntityValue: string,
  ) => void,
  // 新增機器人步驟
  onCreateBotStep: (actionName: string, botRes: string) => void,
  // 編輯機器人回覆
  onEditBotRes: (oriBotRes: string, botRes: string, actionName: string) => void,
  // 刪除使用者步驟
  onRemoveUserStep: (intent: string, userSay: string) => void,
  // 刪除機器人步驟
  onRemoveBotStep: (actionName: string) => void,
  // 新增機器人按鈕選項
  onAddResButtons: (
    actionName: string,
    title: string,
    payload: string,
    reply: string,
    storyName: string,
    stories: StoryType[],
  ) => void,
  onEditResButtons: (
    actionName: string,
    title: string,
    oriPayload: string,
    payload: string,
    reply: string,
    storyName: string,
    buttonActionName: string,
    stories: StoryType[],
  ) => void,
  onRemoveResButton: (actionName: string, payload: string) => void,
  onCreateBranchStory: (newBranchStory: {
    branchName: string,
    slotValues: {
      slotName: string,
      slotValue: string,
      id: string,
      hasSlotValues: boolean,
    }[],
    botRes: { action: string, response: string },
  }) => void,
  // 移除支線故事
  onDeleteBranchStory: (checkPointName: string, branchName: string) => void,
  // 支線故事內串接支線故事
  onConnectBranchStory: (
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
  ) => void,
  // 刪除支線故事內串接的支線故事
  onDeleteConnectBranchStory: (
    checkPointName: string,
    branchName: string,
  ) => void,
  // 編輯支線故事內的機器人回覆
  onEditBranchStoryBotRes: (
    oriBotRes: string,
    botRes: string,
    actionName: string,
    storyName: string,
    checkPointName: string,
  ) => void,
  // 編輯支線故事內串接支線故事的機器人回覆
  onEditConnectStoryBotRes: (
    oriBotRes: string,
    botRes: string,
    actionName: string,
    storyName: string,
    checkPointName: String,
    connectStoryName: string,
  ) => void,
  // 支線故事新增機器人回覆按鈕
  onAddBranchStoryResButtons: (
    actionName: string,
    title: string,
    payload: string,
    reply: string,
    storyName: string,
    stories: StoryType[],
    checkPointName: string,
  ) => void,
  // 移除支線故事的機器人回覆按鈕
  onRemoveBranchStoryResButton: (
    actionName: string,
    payload: string,
    storyName: string,
    buttonActionName: string,
    disabled: boolean,
    checkPointName: string,
  ) => void,
};
