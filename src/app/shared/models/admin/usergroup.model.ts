import { IPagination, IRequest } from "../required/pagination.model";


interface IUserGroup {
  userGroupId?: number;
  abbr?: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserGroupForm extends IUserGroup{}

export type IUserGroupList = IPagination<IUserGroup>;
export type IUserGroupRequest = IRequest<IUserGroupForm>;