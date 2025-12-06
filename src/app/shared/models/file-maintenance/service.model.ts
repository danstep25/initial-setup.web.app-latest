import { IPagination } from "../required/pagination.model"

interface IService extends IServiceForm {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceForm {
  serviceId: number;
  description: string;
  price: number;
}

export type IServiceList = IPagination<IService>;