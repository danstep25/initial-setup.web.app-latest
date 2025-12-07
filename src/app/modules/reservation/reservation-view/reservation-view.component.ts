import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { BaseModule } from '../../../shared/modules/base.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, map, Observable, take } from 'rxjs';
import { LookupService } from '../../../shared/services/lookup.service';
import { formatDate } from '@angular/common';
import { DATE_FORMAT } from '../../../shared/constants/date.constant';
import { STATUS } from '../../../shared/constants/module.constant';

@Component({
  selector: 'app-reservation-view',
  imports: [MatDialogModule, BaseModule, MatFormFieldModule, MatDatepickerModule, MatSelectModule],
  templateUrl: './reservation-view.component.html',
  styleUrl: './reservation-view.component.scss',
})
export class ReservationViewComponent implements OnInit {
  readonly labels = {
    title: 'View Reservation',
    headers: {
      fullName: 'Client Name',
      description: 'Description',
      address: 'Address',
      contactNo: 'Contact No.',
      event: 'Event Type',
      noOfGuest: 'No. Of Guest',
      reservationPackage: 'Reservation Package',
      dateFrom: 'Date From',
      dateTo: 'Date To',
      venue: 'Event Venue',
      totalPrice: 'Total Price',
      discount: 'Discount',
      remarks: 'Remarks',
      service: 'Service',
      price: 'Price',
      quantity: 'Quantity',
      status: 'Payment Status',
      reservationStatus: 'Reservation Status',
    },
  };

  readonly dateFormat = DATE_FORMAT;
  
  // Lookup lists
  readonly eventList$: Observable<{ id: number; value: string }[]>;
  readonly foodPackageList$: Observable<{ id: number; value: string; price?: number }[]>;
  readonly venueList$: Observable<{ id: number; value: string; price?: number }[]>;
  readonly serviceList$: Observable<{ id: number; value: string; price?: number }[]>;
  
  // Processed data for display
  foodPackages: Array<{ name: string; price: number }> = [];
  servicePackages: Array<{ name: string; price: number; quantity: number }> = [];
  venueName: string = '';
  venuePrice: number = 0;
  eventName: string = '';
  reservationData: any = {};

  constructor(
    public dialogRef: MatDialogRef<ReservationViewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _lookupService: LookupService
  ) {
    this.eventList$ = _lookupService.getEventList();
    this.foodPackageList$ = _lookupService.getFoodPackageList();
    this.venueList$ = _lookupService.getVenueList();
    this.serviceList$ = _lookupService.getServiceList();
  }

  ngOnInit(): void {
    console.warn(this.data);
    this.reservationData = this.data;
    this.loadReservationDetails();
  }

  private loadReservationDetails(): void {
    forkJoin({
      foodPackages: this._lookupService.getFoodPackageList().pipe(
        take(1),
        map((data: any) => data.data || data)
      ),
      services: this._lookupService.getServiceList().pipe(
        take(1),
        map((data: any) => data.data || data)
      ),
      venues: this._lookupService.getVenueList().pipe(
        take(1),
        map((data: any) => data.data || data)
      ),
      events: this._lookupService.getEventList().pipe(
        take(1),
        map((data: any) => data.data || data)
      ),
    }).subscribe({
      next: ({ foodPackages, services, venues, events }) => {
        this.processFoodPackages(foodPackages);
        this.processServicePackages(services);
        this.processVenue(venues);
        this.processEvent(events);
      },
      error: (error) => {
        console.error('Error loading reservation details:', error);
        this.processFoodPackagesFallback();
        this.processServicePackagesFallback();
        this.processVenueFallback();
        this.processEventFallback();
      },
    });
  }

  private processFoodPackages(foodPackageList: Array<{ id: number; value: string; price?: number }>): void {
    this.foodPackages = [];
    
    if (!this.data?.reservationPackage || !Array.isArray(this.data.reservationPackage)) {
      return;
    }

    this.data.reservationPackage.forEach((pkg: any) => {
      const packageId = pkg?.packageId || pkg?.id || pkg;
      const foundPackage = foodPackageList?.find((fp) => fp.id === packageId);
      
      if (foundPackage) {
        this.foodPackages.push({
          name: foundPackage.value,
          price: pkg?.price || foundPackage.price || 0,
        });
      } else if (pkg?.name || pkg?.value) {
        this.foodPackages.push({
          name: pkg.name || pkg.value,
          price: pkg.price || 0,
        });
      }
    });
  }

  private processServicePackages(serviceList: Array<{ id: number; value: string; price?: number }>): void {
    this.servicePackages = [];
    
    if (!this.data?.servicePackage || !Array.isArray(this.data.servicePackage)) {
      return;
    }

    this.data.servicePackage.forEach((service: any) => {
      const serviceId = service?.serviceId || service?.id;
      const foundService = serviceList?.find((s) => s.id === serviceId);
      
      if (foundService) {
        this.servicePackages.push({
          name: foundService.value,
          price: service?.price || foundService.price || 0,
          quantity: service?.quantity || 1,
        });
      } else if (service?.name || service?.value) {
        this.servicePackages.push({
          name: service.name || service.value,
          price: service.price || 0,
          quantity: service.quantity || 1,
        });
      }
    });
  }

  private processVenue(venueList: Array<{ id: number; value: string; price?: number }>): void {
    if (!this.data?.venueId) {
      return;
    }

    const foundVenue = venueList?.find((v) => v.id === this.data.venueId);
    
    if (foundVenue) {
      this.venueName = foundVenue.value;
      this.venuePrice = foundVenue.price || this.data.venuePrice || 0;
    } else if (this.data?.venueName || this.data?.venue?.name || this.data?.venue?.value) {
      this.venueName = this.data.venueName || this.data.venue?.name || this.data.venue?.value || '';
      this.venuePrice = this.data.venuePrice || this.data.venue?.price || 0;
    }
  }

  private processEvent(eventList: Array<{ id: number; value: string }>): void {
    if (!this.data?.eventId) {
      return;
    }

    const foundEvent = eventList?.find((e) => e.id === this.data.eventId);
    
    if (foundEvent) {
      this.eventName = foundEvent.value;
    } else if (this.data?.eventName) {
      this.eventName = this.data.eventName;
    }
  }

  private processFoodPackagesFallback(): void {
    this.foodPackages = [];
    
    if (this.data?.foodPackage && Array.isArray(this.data.foodPackage)) {
      this.data.foodPackage.forEach((pkg: any) => {
        this.foodPackages.push({
          name: pkg.name || pkg.value || 'Package',
          price: pkg.price || 0,
        });
      });
    }
  }

  private processServicePackagesFallback(): void {
    this.servicePackages = [];
    
    if (this.data?.servicePackage && Array.isArray(this.data.servicePackage)) {
      this.data.servicePackage.forEach((service: any) => {
        this.servicePackages.push({
          name: service.name || service.value || 'Service',
          price: service.price || 0,
          quantity: service.quantity || 1,
        });
      });
    }
  }

  private processVenueFallback(): void {
    this.venueName = this.data?.venueName || this.data?.venue?.name || '';
    this.venuePrice = this.data?.venuePrice || this.data?.venue?.price || 0;
  }

  private processEventFallback(): void {
    this.eventName = this.data?.eventName || '';
  }

  getPaymentStatus(statusId: any): string {
    const status = String(statusId);
    if (status === '0') {
      return 'Unpaid';
    } else if (status === '1' || status === '2') {
      return 'Partially Paid';
    } else if (status === '3') {
      return 'Fully Paid';
    }
    return 'Unknown';
  }

  formatDateValue(dateValue: any): string {
    if (!dateValue) return 'N/A';
    try {
      const date = new Date(dateValue);
      return formatDate(date, 'MMM dd, yyyy HH:mm', 'en-US');
    } catch {
      return String(dateValue);
    }
  }

  getRefundInfo(): { hasRefund: boolean; reservationFee: number; refundAmount: number; refundPercentage: number; refundMessage: string } {
    // Check if there's actual refund data
    
    const dateFrom = new Date(this.data.dateFrom);
    const validityDate = new Date(this.data.dateFrom);
    validityDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    dateFrom.setHours(0, 0, 0, 0);

    if (this.data?.updatedAt !== null && this.data?.status === STATUS.cancelled) {
      const totalPrice = Number(this.data?.totalPrice) || 0;
      const reservationFee = totalPrice * 0.1;
      var refundAmount = Number(this.data.refundAmount) || 0;
      const refundPercentage = reservationFee > 0 ? (refundAmount / reservationFee) * 100 : 0;
      const daysDifference = Math.floor((dateFrom.getTime() - validityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference < 7) {
        refundAmount = reservationFee * 0.2;
      }

      return {
        hasRefund: true,
        reservationFee,
        refundAmount,
        refundPercentage,
        refundMessage: 'Refund has been processed'
      };
    }

    // Calculate potential refund eligibility
    if (!this.data?.dateFrom) {
      return {
        hasRefund: false,
        reservationFee: 0,
        refundAmount: 0,
        refundPercentage: 0,
        refundMessage: ''
      };
    }

    // Calculate days difference (how many days until the event)
    const today = new Date();
    const daysDifference = Math.floor((dateFrom.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = Number(this.data?.totalPrice) || 0;
    const reservationFee = totalPrice * 0.1;

    if (daysDifference < 0) {
      return {
        hasRefund: false,
        reservationFee,
        refundAmount: 0,
        refundPercentage: 0,
        refundMessage: 'No refund available for past reservations'
      };
    } else if (daysDifference < 7) {
      const refundAmount = reservationFee * 0.2;
      return {
        hasRefund: true,
        reservationFee,
        refundAmount,
        refundPercentage: 20,
        refundMessage: '20% refund available (less than 1 week before event)'
      };
    } else if (daysDifference >= 7 && daysDifference <= 14) {
      return {
        hasRefund: true,
        reservationFee,
        refundAmount: reservationFee,
        refundPercentage: 100,
        refundMessage: 'Full refund available (1-2 weeks before event)'
      };
    } else {
      return {
        hasRefund: true,
        reservationFee,
        refundAmount: reservationFee,
        refundPercentage: 100,
        refundMessage: 'Full refund available (more than 2 weeks before event)'
      };
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}

