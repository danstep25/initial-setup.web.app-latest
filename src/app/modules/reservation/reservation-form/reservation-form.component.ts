import { Component, inject, OnInit } from '@angular/core';
import { formHandler } from '../../../shared/handler/form.handler';
import { IReservationForm } from '../../../shared/models/reservation/reservation.model';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { forkJoin, map, Observable, switchMap, take } from 'rxjs';
import { MODULE } from '../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../shared/constants/action.constant';
import { BaseModule } from '../../../shared/modules/base.module';
import { MatError } from '@angular/material/input';
import { LookupService } from '../../../shared/services/lookup.service';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { formatDate } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTimepickerModule } from '@angular/material/timepicker';

@Component({
  selector: 'app-reservation-form',
  imports: [
    BaseModule,
    MatError,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatTimepickerModule,
  ],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss',
})
export class ReservationFormComponent
  extends formHandler<IReservationForm>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'Reservation',
    ...this.actionType,
    headers: {
      fullName: 'Client Name',
      description: 'Description',
      address: 'Address',
      contactNo: 'Contact No.',
      event: 'Event Type',
      noOfGuest: 'No. Of Guest',
      reservationPackage: 'Reservation Package',
      dateFrom: 'Date From',
      timeFrom: 'Time From',
      dateTo: 'Date To',
      timeTo: 'Time To',
      venue: 'Event Venue',
      totalPrice: 'Total Price',
      discount: 'Discount',
      remarks: 'Remarks',
      service: 'Service',
      price: 'Price',
      quantity: 'Quantity'
    },
  };

  readonly eventList$: Observable<{ id: number; value: string }[]>;
  readonly foodPackageList$: Observable<{ id: number; value: string }[]>;
  readonly venueList$: Observable<{ id: number; value: string }[]>;
  readonly serviceList$: Observable<{ id: number; value: string; price?: number }[]>;

  constructor(private readonly _lookupService: LookupService) {
    super();
    this.eventList$ = _lookupService.getEventList();
    this.foodPackageList$ = _lookupService.getFoodPackageList();
    this.venueList$ = _lookupService.getVenueList();
    this.serviceList$ = _lookupService.getServiceList();
  }

  ngOnInit(): void {
    this.resetForm();
    this._activatedRoute.params
      .pipe(
        take(1),
        switchMap((param) => {
          const id = param?.id;

          return this.sync(MODULE.reservation, { reservationId: id } as any);
        })
      )
      .subscribe({
        next: (data: IReservationForm) => {
          this.formGroup.patchValue({
            reservationId: data.reservationId,
            fullName: data.fullName,
            address: data.address,
            contactNo: data.contactNo,
            eventId: data.eventId,
            venueId: data.venueId,
            isDiscount: Number(data.isDiscount),
            discount: data.discount,
            noOfGuest: data.noOfGuest,
            dateFrom: new Date(data.dateFrom),
            timeFrom: new Date(data.dateFrom),
            dateTo:
              data.dateTo?.toString() === '0000-00-00 00:00:00' ||
              data.dateTo === null
                ? null
                : new Date(data.dateTo),
            timeTo:
              data.dateTo?.toString() === '0000-00-00 00:00:00' ||
              data.dateTo === null
                ? null
                : new Date(data.dateTo),
            totalPrice: data.totalPrice,
            remarks: data?.remarks
          });

          this.onDateInput('dateFrom');
          this.onDateInput('dateTo');
          this.isDiscount();

          data?.reservationPackage?.forEach((items) => {
            this.ReservationPackages.push(this.createReservationPackage(items));
          });

          if (data?.servicePackage && data.servicePackage.length > 0) {
            data.servicePackage.forEach((items, index) => {
              this.ServicePackages.push(this.createService(items));
              // Populate price after service is added
              setTimeout(() => {
                this.populateServicePrice(index, items);
              }, 0);
            });
          }

          this.defaultFormType = ACTION_TYPE.edit;
          
          // Disable isDiscount checkbox if user is not admin
          if (!this.isAdmin()) {
            this.formGroup.get('isDiscount')?.disable();
          }
        },
      });
  }

  resetForm() {
    const isAdmin = this.isAdmin();
    this.formGroup = this.formBuilder.group({
      reservationId: new FormControl(),
      fullName: new FormControl(null, Validators.required),
      address: new FormControl(null, Validators.required),
      contactNo: new FormControl(null, Validators.required),
      eventId: new FormControl(null, Validators.required),
      venueId: new FormControl(null, Validators.required),
      noOfGuest: new FormControl(null, Validators.required),
      reservationPackage: new FormArray([]),
      servicePackage: new FormArray([]),
      isDiscount: new FormControl({ value: false, disabled: !isAdmin }),
      totalPrice: new FormControl(
        { value: 0, disabled: true },
        Validators.required
      ),
      discount: new FormControl(
        { value: '0%', disabled: true },
        Validators.required
      ),
      dateFrom: new FormControl(null, Validators.required),
      dateTo: new FormControl(),
      timeFrom: new FormControl(null, Validators.required),
      timeTo: new FormControl(),
      updatedAt: new FormControl(),
      remarks: new FormControl()
    });
  }

  get ReservationPackages(): FormArray {
    return this.formGroup.get('reservationPackage') as FormArray;
  }

  get ServicePackages(): FormArray {
    return this.formGroup.get('servicePackage') as FormArray;
  }

  removeFoodPackage(index: number) {
    this.ReservationPackages.removeAt(index);
    this.autoCompute();
  }

  addFoodPackage() {
    this.ReservationPackages.push(this.createReservationPackage());
  }

  removeServicePackage(index: number) {
    this.ServicePackages.removeAt(index);
    this.autoCompute();
  }

  addServicePackage() {
    this.ServicePackages.push(this.createService());
  }

  private createReservationPackage(reservationPackage?) {
    return new FormGroup({
      packageId: new FormControl(
        reservationPackage?.packageId,
        Validators.required
      ),
    });
  }

  private createService(service?) {
    const hasServiceId = !!service?.serviceId;
    return new FormGroup({
      serviceId: new FormControl(
        service?.serviceId,
        Validators.required
      ),
      price: new FormControl(
        { value: service?.price || 0, disabled: !hasServiceId },
        [Validators.required, Validators.min(0)]
      ),
      quantity: new FormControl(
        service?.quantity || 1,
        [Validators.required, Validators.min(1)]
      ),
    });
  }

  onDateInput(fieldName: string) {
    let value = this.formGroup.get(fieldName).getRawValue();
    if (!value) return;

    const newDate = formatDate(value, 'yyyy-MM-dd', 'en-PH');
    this.formGroup.get(fieldName).setValue(newDate);
  }

  venueChanges(id: number) {
    this.autoCompute();
  }

  onServiceChange(index: number) {
    const serviceForm = this.ServicePackages.at(index) as FormGroup;
    const serviceId = serviceForm.get('serviceId')?.value;
    this.populateServicePrice(index, { serviceId });
  }

  private populateServicePrice(index: number, serviceData?: any) {
    const serviceForm = this.ServicePackages.at(index) as FormGroup;
    if (!serviceForm) return;
    
    const serviceId = serviceData?.serviceId || serviceForm.get('serviceId')?.value;
    const priceControl = serviceForm.get('price');
    
    if (serviceId) {
      this.serviceList$.pipe(take(1)).subscribe((services: any) => {
        const serviceListData = services.data || services;
        const selectedService = Array.isArray(serviceListData) 
          ? serviceListData.find((s: any) => s.id === serviceId || s.serviceId === serviceId)
          : null;
        
        if (selectedService && selectedService.price !== undefined) {
          // Use price from service list if available
          const servicePrice = selectedService.price || 0;
          priceControl?.enable();
          priceControl?.setValue(servicePrice);
          priceControl?.disable();
        } else if (serviceData?.price !== undefined) {
          // Fallback to price from loaded data
          const servicePrice = serviceData.price || 0;
          priceControl?.enable();
          priceControl?.setValue(servicePrice);
          priceControl?.disable();
        } else {
          // If no price found, set to 0
          priceControl?.enable();
          priceControl?.setValue(0);
          priceControl?.disable();
        }
        this.autoCompute();
      });
    } else {
      priceControl?.enable();
      priceControl?.setValue(0);
      priceControl?.disable();
      this.autoCompute();
    }
  }

  autoCompute() {
    const { totalPrice, venueId } = this.formGroup.controls;

    const packageIds = this.ReservationPackages.controls
      .map((form: FormGroup) =>
        Object.values(form.controls).map(
          (control: AbstractControl) => control.value
        )
      )
      .flat();

    const servicePrices = this.ServicePackages.controls
      .map((form: FormGroup) => {
        const price = Number(form.get('price')?.value) || 0;
        const quantity = Number(form.get('quantity')?.value) || 1;
        return price * quantity;
      })
      .reduce((acc: number, currentPrice: number) => Number(acc) + Number(currentPrice), 0);

    forkJoin([
      this.venueList$.pipe(map((data: any) => data.data)),
      this.foodPackageList$.pipe(
        take(1),
        map((data: any) => data.data)
      ),
      this.serviceList$.pipe(
        take(1),
        map((data: any) => data.data || data)
      ),
    ]).subscribe(([venues, foodPackages, services]) => {
      const venuePrice =
        Number(venues.find((v: any) => v.id === venueId.value)?.price) || 0;

      const packagePrice = packageIds
        .map(
          (id: any) =>
            foodPackages.find((pkg: any) => pkg.id === id)?.price || 0
        )
        .reduce(
          (acc: number, currentPrice: number) =>
            Number(acc) + Number(currentPrice),
          0
        );

      const total = venuePrice + packagePrice + servicePrices;

      totalPrice.setValue(total);
    });
  }

  isDiscount() {
    const { isDiscount, discount } = this.formGroup.controls;
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.role === 'admin';
    
    if (isDiscount.value && isAdmin) {
      return discount.enable();
    }

    discount.disable();
  }

  isAdmin(): boolean {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    return userInfo?.role === 'admin';
  }

  totalPrice() {
    const { totalPrice, isDiscount, discount } = this.formGroup.controls;
    const discountValue = parseFloat(discount?.value.replace('%', '').trim());
    const price = totalPrice?.value ?? 0;

    if (!isNaN(discountValue) && isDiscount?.value) {
      const discountAmount = price * (discountValue / 100);

      const finalPrice = price - discountAmount;
      return finalPrice;
    }

    return price;
  }

  hasDateRangeError(): boolean {
    const dateFrom = this.formGroup.get('dateFrom')?.value;
    const dateTo = this.formGroup.get('dateTo')?.value;
    
    if (!dateTo || !dateFrom) {
      return false;
    }
    
    return new Date(dateTo) < new Date(dateFrom);
  }

  formatDate(){
    const { dateFrom, timeFrom, timeTo, dateTo, totalPrice } = this.formGroup.controls;
    totalPrice.setValue(Number(this.totalPrice()));

    let timeFromValue = new Date(timeFrom.getRawValue());
    let timeToValue = new Date(timeTo.getRawValue());
    let dateFromValue: Date = new Date(dateFrom.getRawValue());
    let dateToValue: Date = new Date(dateTo.getRawValue());

    if(!timeFrom.getRawValue())
      return this.formGroup.markAllAsTouched();
    //DateFrom
    const hourFrom = timeFromValue.getHours();
    const minFrom = timeFromValue.getMinutes();
    
    dateFromValue.setHours(hourFrom, minFrom);
    const timeFromFormat = formatDate(dateFromValue, 'yyyy-MM-dd HH:mm:ss', 'en-PH');
    timeFrom.setValue(timeFromFormat);

    //DateTo
    if(!dateTo.getRawValue()) 
      return timeTo.setValue(null);

    const hourTo = timeToValue?.getHours();
    const minTo = timeToValue?.getMinutes();
    
    dateToValue.setHours(hourTo, minTo);
    const timeToFormat = formatDate(dateToValue, 'yyyy-MM-dd HH:mm:ss', 'en-PH');
    timeTo.setValue(timeToFormat);
  }
}
