import { IPagination } from "../required/pagination.model"

interface IEvent extends IEventForm {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventForm {
  eventId: number;
  description: string;
}

export type IEventList = IPagination<IEvent>;