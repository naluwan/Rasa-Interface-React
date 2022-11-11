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
      examples?: string[] | [],
    }
  | { action: string, response?: string };

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
  onEditExamples: (
    userSay: string,
    intent: string,
    examples: string,
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
  onEditEntityValue: (
    stepIntent: string,
    oriEntityValue: string,
    newEntityValue: string,
    storyName: string,
  ) => void,
};
