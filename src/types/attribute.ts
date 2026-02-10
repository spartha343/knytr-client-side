export interface IAttribute {
  id: string;
  name: string;
  displayName?: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  values?: IAttributeValue[];
}

export interface IAttributeValue {
  id: string;
  attributeId: string;
  value: string;
  colorCode?: string;
  imageUrl?: string;
  createdAt: string;
  attribute?: IAttribute;
}

export interface ICreateAttributeInput {
  name: string;
  displayName?: string;
  type?: string;
}

export interface IUpdateAttributeInput {
  name?: string;
  displayName?: string;
  type?: string;
  isActive?: boolean;
}

export interface ICreateAttributeValueInput {
  attributeId: string;
  value: string;
  colorCode?: string;
  imageUrl?: string;
}

export interface IUpdateAttributeValueInput {
  value?: string;
  colorCode?: string;
  imageUrl?: string;
}
