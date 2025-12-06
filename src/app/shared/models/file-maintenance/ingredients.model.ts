import { IPagination } from "../required/pagination.model"

interface IIngredients extends IIngredientForm {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIngredientForm {
  ingredientId: number;
  name: string;
  description: string;
  qty: number;
  umId: string;
  purchaseDate: Date;
  expirationDate: Date;
  supplierId: number,
}

export type IIngredientsList = IPagination<IIngredients>;