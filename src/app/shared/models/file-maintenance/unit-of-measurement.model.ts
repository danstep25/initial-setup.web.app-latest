import { IPagination } from "../required/pagination.model"

interface IUnitOfMeasurement extends IUnitOfMeasurementForm {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUnitOfMeasurementForm {
  id?: number;
  abbr?: string;
  description?: string;
}

export type IUnitOfMeasurementList = IPagination<IUnitOfMeasurement>;