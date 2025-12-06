import { IPagination } from "../required/pagination.model"

interface IVenue {
  venueId: number,
  name: string,
  price: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}

export interface IVenueForm {
  venueId?: number;
  name?: string;
  price?: string;
  updatedAt?: Date;
}

export type IVenueList = IPagination<IVenue>;