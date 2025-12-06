import { IPagination } from "../required/pagination.model"

interface ICategory extends ICategoryForm {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryForm {
  categoryId?: number;
  description?: string;
}

export type ICategoryList = IPagination<ICategory>;