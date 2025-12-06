import { IPagination } from '../required/pagination.model';

interface ITransaction extends ITransactionForm {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionForm {
  reservationId: number;
  fullName: string;
  address: string;
  contactNo: number;
  eventId: number;
  venueId: number;
  noOfGuest: number;
  reservationPackage: Array<number>;
  dateFrom: Date;
  dateTo: Date;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  discount: string;
  isDiscount: boolean;
  totalPrice: number;
  balance: number;
};

export type ITransactionList = IPagination<ITransaction>;
export type IReservations = Array<ITransaction>
