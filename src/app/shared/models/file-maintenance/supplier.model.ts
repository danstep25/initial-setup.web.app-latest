import { IPagination } from "../required/pagination.model"

interface ISupplier {
  supplierId: number,
  name: string,
  contact: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}

export interface ISupplierForm {
  supplierId?: number;
  name?: string;
  contact?: string;
  description?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ISupplierList = IPagination<ISupplier>