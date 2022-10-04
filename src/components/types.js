export type NavItemType = {
  id: number,
  name: string,
  link: string,
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
  entitiesKey: string,
};

export type StepsType =
  | {
      intent: string,
      user: string,
      entities: array | null,
      examples: array | null,
    }
  | { action: string, response: string };

export type StoryType = {
  story: string,
  steps: StepsType[],
};
