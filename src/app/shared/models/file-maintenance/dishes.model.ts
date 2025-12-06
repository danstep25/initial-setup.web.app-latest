import { IPagination } from "../required/pagination.model"

interface IDishes extends IDishesForm {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IIngredients {
  ingredientId: number;
  qty: number;
}

export interface IDishesForm {
  dishId?: number;
  name?: string;
  description?: string;
  ingredients?: Array<IIngredients>,
  categoryId: number,
  price: number
}

export type IDishesList = IPagination<IDishes>;