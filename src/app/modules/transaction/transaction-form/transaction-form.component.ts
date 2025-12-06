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
import { TransactionService } from './transaction.service';
import { ToastService } from '../../../shared/services/toast.service';
import { TOAST_TYPE } from '../../../shared/constants/icon.constant';
import {MatRadioModule} from '@angular/material/radio';
import { Subscription, forkJoin, map, take } from 'rxjs';
import { LookupService } from '../../../shared/services/lookup.service';

@Component({
  selector: 'app-transaction-form',
  imports: [MatDialogModule, BaseModule, MatFormFieldModule, MatRadioModule],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss',
})
export class TransactionFormComponent implements OnInit, OnDestroy {
  readonly labels = {
    title: 'Payment',
    headers: {
      fullName: 'Full Name',
      description: 'Description',
      address: 'Address',
      contactNo: 'Contact No.',
      event: 'Event',
      noOfGuest: 'No. Of Guest',
      reservationPackage: 'Reservation Package',
      dateFrom: 'Date From',
      dateTo: 'Date To',
      venue: 'Venue',
      service: 'Service',
      totalPrice: 'Total Price',
      discount: 'Discount',
      amount: 'Amount',
      refNo: 'Ref. No.'
    },
  };

  isExcess = false;
  currentPayment = '0';
  totalPaid: number = 0;
  totalPaidPercentage: number = 0;
  private paymentOptionSubscription?: Subscription;
  private paymentMethodSubscription?: Subscription;
  
  // Processed data for display
  foodPackages: Array<{ name: string; price: number }> = [];
  servicePackages: Array<{ name: string; price: number; quantity: number }> = [];
  venueName: string = '';
  venuePrice: number = 0;

  constructor(
    private dialogRef: MatDialogRef<TransactionFormComponent>,
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

  readonly paymentOption = [
    'Partial',
    'Full',
  ];

  ngOnInit(): void {
    this.resetForm();

    this.formGroup.patchValue({
      reservationId: this.data.reservationId,
    });

    // Process and load reservation details (food packages, services, venue)
    this.loadReservationDetails();

    // Calculate total paid and percentage
    this.calculateTotalPaid();

    // If refund mode, set refund amount and skip payment-related logic
    if (this.data?.isRefund) {
      const refundAmount = this.data?.refundAmount || 0;
      this.formGroup.patchValue({
        amount: refundAmount,
      });
      // Disable amount field for refunds
      this.formGroup.get('amount')?.disable();
    } else {
      // Calculate initial current payment
      this.calculateCurrentPayment();

      // Set initial refNo validation based on default payment method
      this.updateRefNoValidation();

      // Subscribe to payment option changes
      this.paymentOptionSubscription = this.formGroup
        .get('paymentOption')
        ?.valueChanges.subscribe((paymentOption: string) => {
          this.calculateCurrentPayment();
          this.updateAmountField();
        });

      // Subscribe to payment method changes
      this.paymentMethodSubscription = this.formGroup
        .get('paymentMethod')
        ?.valueChanges.subscribe(() => {
          this.updateRefNoValidation();
        });
    }
  }

  ngOnDestroy(): void {
    this.paymentOptionSubscription?.unsubscribe();
    this.paymentMethodSubscription?.unsubscribe();
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

  private calculateTotalPaid(): void {
    const { balance, totalPrice } = this.data;
    const totalPriceNum = Number(totalPrice) || 0;
    const balanceNum = Number(balance) || 0;
    
    // Calculate total paid (totalPrice - balance)
    this.totalPaid = totalPriceNum - balanceNum;
    
    // Calculate percentage (totalPaid / totalPrice * 100)
    if (totalPriceNum > 0) {
      this.totalPaidPercentage = (this.totalPaid / totalPriceNum) * 100;
    } else {
      this.totalPaidPercentage = 0;
    }
  }

  private calculateCurrentPayment(): void {
    const paymentOption = this.formGroup.get('paymentOption')?.value;
    const { balance, totalPrice, statusId } = this.data;

    // If payment option is "Full", set current payment to balance (or total price if balance is 0)
    if (paymentOption === 'Full') {
      const balanceAmount = balance == 0 ? totalPrice : balance;
      this.currentPayment = Number(balanceAmount).toFixed(2);
      return;
    }

    // Otherwise, calculate based on statusId (Partial payment)
    let totalPaid = Number(totalPrice) - Number(balance);

    switch (statusId) {
      case '0':
        this.currentPayment = (Number(totalPrice) * 0.3).toFixed(2);
        break;

      case '1':
        this.currentPayment = (Number(totalPrice) * 0.5 - totalPaid).toFixed(2);
        break;

      case '2':
        this.currentPayment = (Number(totalPrice) * 1 - totalPaid).toFixed(2);
        break;

      default:
        this.currentPayment = '0';
        break;
    }
  }

  private updateAmountField(): void {
    const paymentOption = this.formGroup.get('paymentOption')?.value;
    const amountControl = this.formGroup.get('amount');

    if (paymentOption === 'Full') {
      const { balance, totalPrice } = this.data;
      const balanceAmount = balance == 0 ? totalPrice : balance;
      amountControl?.setValue(Number(balanceAmount), { emitEvent: false });
    } else {
      // Reset to 0 for partial payment
      amountControl?.setValue(0, { emitEvent: false });
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

  formGroup: FormGroup;

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    // optional result
    this.isValid();
  }

  private isValid() {
    this.formGroup.markAllAsTouched();
    
    // For refunds, use refund amount validation
    if (this.data?.isRefund) {
      const refundAmount = this.data?.refundAmount || 0;
      const enteredAmount = Number(this.formGroup.get('amount')?.value || 0);
      
      if (enteredAmount > refundAmount) {
        this._toastService.show(TOAST_TYPE.error, 'Refund amount cannot exceed the maximum refund amount');
        return;
      }
      
      if (this.formGroup.valid) {
        // Enable amount field temporarily to get the value
        const amountValue = this.formGroup.get('amount')?.value;
        this.formGroup.get('amount')?.enable();
        const formValue = this.formGroup.getRawValue();
        formValue.amount = amountValue;
        this.formGroup.get('amount')?.disable();
        
        this._transactionService
          .updateTransaction({ ...formValue, isRefund: true })
          .subscribe({
            next: (response: any) => {
              this._toastService.show(TOAST_TYPE.success, response.message || 'Refund processed successfully');
              this.dialogRef.close({
                submitted: true,
                message: response.message || null,
              });
            },
            error: (error: any) => {
              this._toastService.show(TOAST_TYPE.error, error.error?.message || 'Failed to process refund');
            },
          });
      }
      return;
    }

    // Original payment validation logic
    this.isExcess =
      Number(
        this.data.balance == 0 ? this.data.totalPrice : this.data.balance
      ) < Number(this.formGroup.get('amount').value);

    if (this.formGroup.valid && !this.isExcess && this.validPaymentTerms()) {
      this._transactionService
        .updateTransaction(this.formGroup.getRawValue())
        .subscribe();
      this.dialogRef.close({
        submitted: true,
        message: this.data?.message || null, // only return primitive or safe value
      });
    }

    return;
  }

  resetForm() {
    const isRefund = this.data?.isRefund;
    const maxAmount = isRefund 
      ? (this.data?.maxRefundAmount || this.data?.refundAmount || 0)
      : (this.data.balance == 0 ? this.data.totalPrice : this.data.balance);

    this.formGroup = this._formBuilder.group({
      amount: new FormControl(isRefund ? (this.data?.refundAmount || 0) : 0, [
        Validators.required,
        Validators.max(maxAmount),
      ]),
      paymentMethod: new FormControl('Cash', isRefund ? [] : [Validators.required]),
      paymentOption: new FormControl('Partial', isRefund ? [] : [Validators.required]),
      refNo: new FormControl(''),
      reservationId: new FormControl(null, Validators.required),
    });
  }

  get PaymentMethod(){
    return this.formGroup.get('paymentMethod').value;
  }

  protected hasError(fieldName: string) {
    if (fieldName) {
      return this.formGroup.get(`${fieldName}`)?.hasError('required');
    }

    return false;
  }

  protected maxValueError(fieldName: string) {
    if (fieldName) return this.formGroup.get(`${fieldName}`)?.hasError('max');

    return false;
  }

  private validPaymentTerms() {
    const { amount } = this.formGroup.getRawValue();
    const { balance, totalPrice } = this.data;
    const totalPaid = Number(totalPrice) - Number(balance);

    if (
      this.data.statusId === '0' &&
      Number(amount) >= Number(totalPrice) * 0.3
    ) {
      return true;
    } else if (
      this.data.statusId === '1' &&
      Number(amount) + Number(totalPaid) >= Number(totalPrice) * 0.5
    ) {
      return true;
    } else if (
      this.data.statusId === '2' &&
      Number(amount) + Number(totalPaid) >= Number(totalPrice) * 1.0
    ) {
      return true;
    }

    this._toastService.show(TOAST_TYPE.error, 'Invalid amount');
    return false;
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
