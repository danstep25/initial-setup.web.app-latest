import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginationHandler } from '../../../shared/handler/pagination.handler';
import { IPaginationFilterBase } from '../../../shared/models/required/pagination.model';
import {
  catchError,
  forkJoin,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { IReservationList } from '../../../shared/models/reservation/reservation.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiBaseService } from '../../../shared/services/api-base.service';
import { API_URL } from '../../../shared/constants/api.url.constant';
import { DEFAULT_PAGINATION } from '../../../shared/constants/pagination.constant';
import { BaseModule } from '../../../shared/modules/base.module';
import { PaginationModule } from '../../../shared/modules/pagination.module';
import { TransactionFormComponent } from '../../transaction/transaction-form/transaction-form.component';
import { ReservationFeeFormComponent } from '../reservation-fee-form/reservation-fee-form.component';
import { MatDialog } from '@angular/material/dialog';
import { STATUS } from '../../../shared/constants/module.constant';
import { TOAST_TYPE } from '../../../shared/constants/icon.constant';
import { ToastService } from '../../../shared/services/toast.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { formatDate } from '@angular/common';
import { ExportService } from '../../../shared/services/export.service';
import { MODULE } from '../../../shared/constants/module.constant';
import { ReservationService } from '../reservation.service';
import { take } from 'rxjs';
import { LookupService } from '../../../shared/services/lookup.service';

@Component({
  selector: 'app-reservation-list',
  imports: [BaseModule, PaginationModule, MatDatepickerModule],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss',
})
export class ReservationListComponent
  extends PaginationHandler<IPaginationFilterBase>
  implements OnInit, OnDestroy
{
  reservationsList$: Observable<IReservationList>;
  private readonly _destroy$ = new Subject<void>();

  readonly labels = {
    headers: {
      fullName: 'Full Name',
      address: 'Address',
      contactNo: 'Contact No.',
      scheduledDate: 'Scheduled Date',
      description: 'Description',
      createdAt: 'Created At',
      updatedAt: 'Update At',
      status: 'Status',
      reservationStatus: 'Reservation Status',
      action: 'Actions',
    },
    placeholder: {
      search: 'Search',
      reset: 'Reset',
    },
    actions: {
      edit: 'Edit',
      delete: 'Delete',
      pay: 'Pay',
      refund: 'Refund',
      generateReport: 'Generate Report'
    },
    new: 'New',
    viewCalendar: 'View Calendar',
    generate: 'Generate',
  };

  readonly reservationStatus = STATUS;
  readonly dateNow = new Date().toISOString();

  constructor(
    private readonly _formBuilder: FormBuilder,
    readonly _apiService: ApiBaseService<
      IPaginationFilterBase,
      IReservationList
    >,
    private readonly toastService: ToastService,
    private readonly _exportService: ExportService,
    private readonly _reservationService: ReservationService,
    private readonly _lookupService: LookupService
  ) {
    super(_apiService);
  }

  ngOnInit(): void {
    this.reservationsList$ = this._apiService.filterParams$.pipe(
      takeUntil(this._destroy$),
      switchMap((params) => {
        if (params.isRefresh) {
          this.resetForm();
          params.isRefresh = false;
        }

        this.paginationFilter = params as IPaginationFilterBase;

        return this._apiService.get(
          this.paginationFilter,
          `${API_URL.reservation.reservation}`
        );
      }),

      tap(({ pageIndex, pageSize, totalRecords, totalPages }) => {
        Object.assign(this.paginate, {
          pageIndex,
          pageSize,
          totalRecords,
          totalPages,
        });
      }),
      catchError(() => {
        return of({ data: null, ...DEFAULT_PAGINATION } as IReservationList);
      })
    );

    this.resetForm();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.resetFilter();
  }

  reservationFormGroup: FormGroup;

  resetForm() {
    this.reservationFormGroup = this._formBuilder.group({
      searchValue: new FormControl(),
      dateFrom: new FormControl(),
      dateTo: new FormControl(),
    });
  }

  onDateInput(fieldName: string) {
    const control = this.reservationFormGroup.get(fieldName);
    if (!control || !control.value) return;
    // Keep as Date object - will be formatted when filtering if needed
  }

  getDataName(row: any): string {
    return row?.fullName || 'Reservation';
  }

  hasPermission(): boolean {
    return true; // Implement permission logic as needed
  }

  override searchFilter(form: FormGroup): void {
    const formValue = form.getRawValue();
    
    // Format dates if they exist
    if (formValue.dateFrom && formValue.dateFrom instanceof Date) {
      formValue.dateFrom = formatDate(formValue.dateFrom, 'yyyy-MM-dd', 'en-PH');
    }
    if (formValue.dateTo && formValue.dateTo instanceof Date) {
      formValue.dateTo = formatDate(formValue.dateTo, 'yyyy-MM-dd', 'en-PH');
    }

    this.paginationFilter = {
      ...this.paginate,
      ...formValue,
    } as IPaginationFilterBase;

    this._apiService.paginationFilter(this.paginationFilter);
  }

  openDialog(data): void {
    // If status is PENDING (statusId === '0'), show reservation fee form
    // Otherwise, show transaction form
    const isPending = data?.status === STATUS.pending;
    
    let dialogRef;
    if (isPending) {
      dialogRef = this._dialog.open(ReservationFeeFormComponent, {
        data: data,
        width: '550px',
      });
    } else {
      dialogRef = this._dialog.open(TransactionFormComponent, {
        data: data,
        width: '600px',
      });
    }

    dialogRef.afterClosed().subscribe(() => {
      this.resetFilter();
    });
  }

  openRefundDialog(data): void {
    // Validate refund eligibility based on dateFrom
    if (!data?.dateFrom) {
      this.toastService.show(TOAST_TYPE.error, 'Invalid reservation date');
      return;
    }

    const dateFrom = new Date(data.dateFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    dateFrom.setHours(0, 0, 0, 0);

    // Calculate days difference
    const daysDifference = Math.floor((dateFrom.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate reservation fee (10% of total price)
    const totalPrice = Number(data?.totalPrice) || 0;
    const reservationFee = totalPrice * 0.1;

    let refundAmount = 0;
    let refundMessage = '';

    // Refund validation logic
    if (daysDifference < 0) {
      // Past date - no refund allowed
      this.toastService.show(TOAST_TYPE.error, 'Refund is not available for past reservations');
      return;
    } else if (daysDifference < 7) {
      // Less than 1 week before dateFrom - only 20% of reservationFee
      refundAmount = reservationFee * 0.2;
      refundMessage = `Refund available: 20% of reservation fee (₱${refundAmount.toFixed(2)}) due to cancellation less than 1 week before the event.`;
    } else if (daysDifference >= 7 && daysDifference <= 14) {
      // 1 to 2 weeks before dateFrom - full refund available
      refundAmount = reservationFee;
      refundMessage = `Full refund available: 100% of reservation fee (₱${refundAmount.toFixed(2)}) as cancellation is 1-2 weeks before the event.`;
    } else {
      // More than 2 weeks before dateFrom - full refund available
      refundAmount = reservationFee;
      refundMessage = `Full refund available: 100% of reservation fee (₱${refundAmount.toFixed(2)}) as cancellation is more than 2 weeks before the event.`;
    }

    // Show refund information
    this.toastService.show(TOAST_TYPE.success, refundMessage);

    // Open refund dialog with calculated refund amount
    const dialogRef = this._dialog.open(TransactionFormComponent, {
      data: { 
        ...data, 
        isRefund: true,
        refundAmount: refundAmount,
        maxRefundAmount: refundAmount
      },
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.resetFilter();
    });
  }

  getStyle(statusId: string) {
    switch (statusId) {
      case '1':
      case '2':
        return { 'background-color': 'orange', color: 'white' };
      case '3':
        return { 'background-color': 'green', color: 'white' };
      default:
        return { 'background-color': 'gray', color: 'white' };
    }
  }

  getReservationStyle(reservationStatus: string) {
    switch (reservationStatus) {
      case STATUS.active:
        return { 'background-color': 'green', color: 'white' };
      case STATUS.cancelled:
        return { 'background-color': 'red', color: 'white' };
      default:
        return { 'background-color': 'gray', color: 'white' };
    }
  }

  getStatus(statusId: string){
    switch (statusId) {
      case '0':
        return 'Unpaid';
      case '1':
      case '2':
        return 'Partially Paid';
      case '3':
        return 'Fully Paid';
    }
  }

  generate(){
    this._reservationService.generate()
    .pipe(take(1))
    .subscribe((response: any)=>{
      const result = response.data;
      this._exportService.exportToPdf(result, 'reservations.pdf', MODULE.reservation);
    });
  }

  generateIndividualReport(row: any): void {
    if (!row?.reservationId) {
      this.toastService.show(TOAST_TYPE.error, 'Invalid reservation data');
      return;
    }
    // Fetch reservation data and lookup lists in parallel
    forkJoin({
      reservation: this._reservationService.generateIndividual(row.reservationId),
      foodPackages: this._lookupService.getFoodPackageList(),
      services: this._lookupService.getServiceList(),
      events: this._lookupService.getEventList(),
      venues: this._lookupService.getVenueList()
    })
      .pipe(take(1))
      .subscribe({
        next: (result: any) => {
          const reservation = result.reservation;
          const foodPackages = result.foodPackages?.data || result.foodPackages;
          const services = result.services?.data || result.services;
          const events = result.events?.data || result.events;
          const venues = result.venues?.data || result.venues;
          
          const reservationData = row;
          const filename = `reservation-${row.reservationId}-${row.fullName || 'detail'}.pdf`.replace(/\s+/g, '-');
          
          // Create lookup maps with names and prices
          const foodPackageLookup = new Map<number, { name: string; price?: number }>();
          if (foodPackages && Array.isArray(foodPackages)) {
            foodPackages.forEach((pkg: any) => {
              foodPackageLookup.set(pkg.id, {
                name: pkg.value,
                price: pkg.price
              });
            });
          }

          const serviceLookup = new Map<number, { name: string; price?: number }>();
          if (services && Array.isArray(services)) {
            services.forEach((svc: any) => {
              serviceLookup.set(svc.id, {
                name: svc.value,
                price: svc.price
              });
            });
          }

          const eventLookup = new Map<number, string>();
          if (events && Array.isArray(events)) {
            events.forEach((event: any) => {
              eventLookup.set(event.id, event.value);
            });
          }

          const venueLookup = new Map<number, { name: string; price?: number }>();
          if (venues && Array.isArray(venues)) {
            venues.forEach((venue: any) => {
              venueLookup.set(venue.id, {
                name: venue.value,
                price: venue.price
              });
            });
          }
          console.warn(reservationData);
          this._exportService.exportIndividualReservationToPdf(
            reservationData, 
            filename,
            foodPackageLookup,
            serviceLookup,
            eventLookup,
            venueLookup
          );
          this.toastService.show(TOAST_TYPE.success, 'Reservation report generated successfully');
        },
        error: (error) => {
          console.error('Error generating individual report:', error);
          this.toastService.show(TOAST_TYPE.error, 'Failed to generate reservation report');
        }
      });
  }
}
