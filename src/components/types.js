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

export type State = {
  isAppInitializedComplete: boolean,
  user: UserInfo,
  loading: boolean,
  stories: StoryType[],
  story: StoryType,
  // actions
  init: () => void,
  onLogin: (email: string, password: string) => void,
  onLogout: () => void,
  onRegister: (userInfo: RegisterUserInfoType) => void,
  setStory: (storyName: string) => void,
  setStories: (stories: StoryType[]) => void,
};
