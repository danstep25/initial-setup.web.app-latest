import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { BaseModule } from '../../../shared/modules/base.module';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TransactionService } from '../../transaction/transaction-form/transaction.service';
import { ToastService } from '../../../shared/services/toast.service';
import { TOAST_TYPE } from '../../../shared/constants/icon.constant';
import { MatRadioModule } from '@angular/material/radio';
import { Subscription, forkJoin, map, take } from 'rxjs';
import { LookupService } from '../../../shared/services/lookup.service';

@Component({
  selector: 'app-reservation-fee-form',
  imports: [MatDialogModule, BaseModule, MatFormFieldModule, MatRadioModule],
  templateUrl: './reservation-fee-form.component.html',
  styleUrl: './reservation-fee-form.component.scss',
})
export class ReservationFeeFormComponent implements OnInit, OnDestroy {
  readonly labels = {
    title: 'Reservation Fee Payment',
    headers: {
      fullName: 'Full Name',
      description: 'Description',
      address: 'Address',
      contactNo: 'Contact No.',
      reservationPackage: 'Reservation Package',
      venue: 'Venue',
      service: 'Service',
      totalPrice: 'Total Price',
      reservationFee: 'Reservation Fee',
      amount: 'Amount',
      refNo: 'Ref. No.',
    },
  };

  private paymentMethodSubscription?: Subscription;
  
  // Processed data for display
  foodPackages: Array<{ name: string; price: number }> = [];
  servicePackages: Array<{ name: string; price: number; quantity: number }> = [];
  venueName: string = '';
  venuePrice: number = 0;
  reservationFee: number = 0;

  constructor(
    private dialogRef: MatDialogRef<ReservationFeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _transactionService: TransactionService,
    private readonly _toastService: ToastService,
    private readonly _lookupService: LookupService
  ) {}

  readonly paymentMethod = [
    'Cash',
    'G-Cash/Bank',
  ];

  formGroup: FormGroup;

  ngOnInit(): void {
    this.resetForm();

    this.formGroup.patchValue({
      reservationId: this.data.reservationId,
    });

    // Calculate reservation fee (30% of total price)
    this.calculateReservationFee();

    // Process and load reservation details (food packages, services, venue)
    this.loadReservationDetails();

    // Set initial refNo validation based on default payment method
    this.updateRefNoValidation();

    // Subscribe to payment method changes
    this.paymentMethodSubscription = this.formGroup
      .get('paymentMethod')
      ?.valueChanges.subscribe(() => {
        this.updateRefNoValidation();
      });
  }

  ngOnDestroy(): void {
    this.paymentMethodSubscription?.unsubscribe();
  }

  private calculateReservationFee(): void {
    const totalPrice = Number(this.data?.totalPrice) || 0;
    // Reservation fee is 10% of total price
    this.reservationFee = totalPrice * 0.1;
    
    // Set the amount field to reservation fee
    this.formGroup.patchValue({
      amount: this.reservationFee,
    });
  }

  private loadReservationDetails(): void {
    // Fetch all lookup data in parallel
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
    })
      .subscribe({
        next: ({ foodPackages, services, venues }) => {
          // Process food packages
          this.processFoodPackages(foodPackages);
          
          // Process service packages
          this.processServicePackages(services);
          
          // Process venue
          this.processVenue(venues);
        },
        error: (error) => {
          console.error('Error loading reservation details:', error);
          // Fallback: use data as-is if lookup fails
          this.processFoodPackagesFallback();
          this.processServicePackagesFallback();
          this.processVenueFallback();
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
        // Fallback: use data directly if it has name/value
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
        // Fallback: use data directly if it has name/value
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
      // Fallback: use data directly
      this.venueName = this.data.venueName || this.data.venue?.name || this.data.venue?.value || '';
      this.venuePrice = this.data.venuePrice || this.data.venue?.price || 0;
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
    } else if (this.data?.foodPackageName) {
      this.foodPackages.push({
        name: this.data.foodPackageName,
        price: this.data.foodPackagePrice || 0,
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
    } else if (this.data?.serviceName) {
      this.servicePackages.push({
        name: this.data.serviceName,
        price: this.data.servicePrice || 0,
        quantity: this.data.serviceQuantity || 1,
      });
    }
  }

  private processVenueFallback(): void {
    if (this.data?.venueName || this.data?.venue?.name || this.data?.venue?.value) {
      this.venueName = this.data.venueName || this.data.venue?.name || this.data.venue?.value || '';
      this.venuePrice = this.data.venuePrice || this.data.venue?.price || 0;
    }
  }

  private updateRefNoValidation(): void {
    const paymentMethod = this.formGroup.get('paymentMethod')?.value;
    const refNoControl = this.formGroup.get('refNo');

    if (paymentMethod === 'G-Cash/Bank') {
      // Add required validator for G-Cash/Bank
      refNoControl?.setValidators([Validators.required]);
    } else {
      // Remove required validator for Cash
      refNoControl?.clearValidators();
    }

    // Update validation status
    refNoControl?.updateValueAndValidity({ emitEvent: false });
  }

  resetForm() {
    this.formGroup = this._formBuilder.group({
      amount: new FormControl(0, [
        Validators.required,
        Validators.min(0.01),
      ]),
      paymentMethod: new FormControl('Cash', Validators.required),
      refNo: new FormControl(''),
      reservationId: new FormControl(null, Validators.required),
      paymentOption: new FormControl('Partial', Validators.required), // For reservation fee, it's always partial
      reservationFee: new FormControl(true)
    });
  }

  get PaymentMethod() {
    return this.formGroup.get('paymentMethod')?.value;
  }

  protected hasError(fieldName: string) {
    if (fieldName) {
      return this.formGroup.get(`${fieldName}`)?.hasError('required');
    }
    return false;
  }

  protected minValueError(fieldName: string) {
    if (fieldName) return this.formGroup.get(`${fieldName}`)?.hasError('min');
    return false;
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.isValid();
  }

  private isValid() {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.valid) {
      this._transactionService
        .updateTransaction(this.formGroup.getRawValue())
        .subscribe({
          next: (response: any) => {
            this._toastService.show(TOAST_TYPE.success, response.message || 'Reservation fee paid successfully');
            this.dialogRef.close({
              submitted: true,
              message: response.message || null,
            });
          },
          error: (error: any) => {
            this._toastService.show(TOAST_TYPE.error, error.error?.message || 'Failed to process reservation fee payment');
          },
        });
    }
  }

  onlyAllowDecimal(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const key = event.key;

    // Allow control keys (Backspace, Tab, Delete, Arrow keys)
    if (
      ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(key)
    ) {
      return;
    }

    // Allow only digits and one decimal point
    if (!/[0-9.]/.test(key)) {
      event.preventDefault();
      return;
    }

    // Prevent multiple decimals
    if (key === '.' && value.includes('.')) {
      event.preventDefault();
      return;
    }

    // Limit to 2 decimal places
    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1) {
      const decimals = value.substring(decimalIndex + 1);
      const cursorPos = input.selectionStart ?? value.length;
      // If cursor is after the decimal and already 2 digits exist → block input
      if (cursorPos > decimalIndex && decimals.length >= 2) {
        event.preventDefault();
      }
    }
  }

  onPasteDecimal(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    // Allow only numbers with up to 2 decimal places
    if (!/^\d+(\.\d{0,2})?$/.test(pasted)) {
      event.preventDefault();
    }
  }
}

