import { IPagination, IRequest } from '../required/pagination.model';

interface IUser {
  username: string,
  password: string
}

export interface IUserInfo {
  username?: string;
  firstname?: string;
  middlename?: string;
  lastname?: string;
}

export interface IUserForm extends IUserInfo {
  userId?: number,
  password?: string,
  suffix?: string,
  createdAt?: Date,
  updatedAt?: Date,
  role:string
}

export type IUserAuthenticationRequest = IUser;
export type IUserList = IPagination<IUser>;
export type IUserRequest = IRequest<IUserForm>;