export enum ResourceType {
  BOOK = "BOOK",
  VIDEO = "VIDEO",
  ARTICLE = "ARTICLE",
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
}