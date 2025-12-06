import { IPagination } from "../required/pagination.model"

interface IFoodPackage extends IFoodPackageForm {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IDish {
  dishId: number;
  servingSize: number;
}

export interface IFoodPackageForm {
  foodPackageId?: number;
  name?: string;
  description?: string;
  dishes?: Array<IDish>;
  pax?: string;
  price: number;
}

export type IFoodPackageList = IPagination<IFoodPackage>;