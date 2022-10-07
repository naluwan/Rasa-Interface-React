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

export type StepsType =
  | {
      intent: string,
      user: string,
      entities: EntitiesType[] | [],
      examples: string[] | [],
    }
  | { action: string, response: string };

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

export type State = {
  isAppInitializedComplete: boolean,
  user: UserInfo,
  loading: boolean,
  stories: StoryType[],
  domain: DomainType,
  nlu: NluType,
  story: StoryType,
  // actions
  init: () => void,
  onLogin: (email: string, password: string) => void,
  onLogout: () => void,
  onRegister: (userInfo: RegisterUserInfoType) => void,
  onSetAllTrainData: (data: TrainDataType) => void,
  onSetStory: (storyName: string) => void,
};
