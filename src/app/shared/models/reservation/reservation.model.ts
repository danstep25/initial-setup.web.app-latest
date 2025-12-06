import { IPagination } from '../required/pagination.model';

export interface ICalendarDate {
  year: number;
  month: number;
  date: number;
  daysOfWeek: string;
};

interface IReservation extends IReservationForm {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReservationForm {
  reservationId: number;
  fullName: string;
  address: string;
  contactNo: number;
  eventId: number;
  venueId: number;
  noOfGuest: number;
  reservationPackage: Array<number>;
  servicePackage: Array<number>;
  dateFrom: Date;
  dateTo: Date;
  createdAt: Date;
  updatedAt: Date;
  description: string;
  discount: string;
  isDiscount: boolean;
  totalPrice: number;
  remarks: string;
};

export type IReservationList = IPagination<IReservation>;
export type IReservations = Array<IReservation>
