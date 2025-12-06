import { Component, OnInit, OnDestroy } from '@angular/core';
import { BaseModule } from '../../../shared/modules/base.module';
import { BehaviorSubject, Observable, take, takeUntil, Subject, combineLatest, startWith, distinctUntilChanged } from 'rxjs';
import {
  ICalendarDate,
  IReservationList,
  IReservations,
} from '../../../shared/models/reservation/reservation.model';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ApiBaseService } from '../../../shared/services/api-base.service';
import { API_URL } from '../../../shared/constants/api.url.constant';

@Component({
  selector: 'app-reservation-list-calendar',
  imports: [BaseModule, MatSelectModule],
  templateUrl: './reservation-list-calendar.component.html',
  styleUrl: './reservation-list-calendar.component.scss',
})
export class ReservationListCalendarComponent implements OnInit, OnDestroy {
  currentCalendarDay = new Date();
  currentYear = this.currentCalendarDay.getFullYear();
  currentMonth = this.currentCalendarDay.getMonth();
  currentDate = this.currentCalendarDay.getDate();

  reservationsList$: Observable<IReservations>;
  currentEventList$: Observable<IReservations>;
  upcomingEventList$: Observable<IReservations>;
  years = [];
  daysOfMonth$ = new BehaviorSubject(null);
  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  reservationCounts: Map<string, number> = new Map();
  private _destroy$ = new Subject<void>();
  month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  constructor(
    private readonly _router: Router,
    private readonly _apiBaseService: ApiBaseService
  ) {}

  ngOnInit(): void {
    this.resetForm();
    this.getDayOfMonth(this.currentMonth, this.currentYear);
    this.generateDropdownYear();
    this.getCurrentEvents();
    this.getUpcomingEvents();
    
    // Subscribe to form changes to reload counts when month/year changes
    // Use startWith to ensure initial values are included
    combineLatest([
      this.calendarForm.get('year')!.valueChanges.pipe(
        startWith(this.calendarForm.get('year')!.value),
        distinctUntilChanged()
      ),
      this.calendarForm.get('month')!.valueChanges.pipe(
        startWith(this.calendarForm.get('month')!.value),
        distinctUntilChanged()
      )
    ]).pipe(
      takeUntil(this._destroy$),
      distinctUntilChanged((prev, curr) => prev[0] === curr[0] && prev[1] === curr[1])
    ).subscribe(([year, month]) => {
      if (year && month) {
        const monthIndex = this.month.findIndex((x) => x === month);
        if (monthIndex !== -1) {
          this.getDayOfMonth(monthIndex, year);
          this.loadReservationCountsForMonth(year, month);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  getDayOfMonth(month: number, year: number) {
    let date = new Date();
    date.setFullYear(year);
    date.setMonth(month);
    let dates: Array<ICalendarDate> = [];

    const getRange = (date: Date) => {
      let minDate = new Date(date.getFullYear(), date.getMonth(), 1);
      let maxDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      return { minDate: minDate, maxDate: maxDate };
    };

    let { minDate, maxDate } = getRange(date);

    for (var i = minDate.getDate(); i <= maxDate.getDate(); i++) {
      date.setDate(i);
      const CalendarDate: ICalendarDate = {
        year: date.getFullYear(),
        month: date.getMonth(),
        daysOfWeek: this.daysOfWeek[date.getDay()],
        date: i,
      };

      dates.push(CalendarDate);
    }

    this.daysOfMonth$.next(dates);
  }

  getStartDayOfWeek(dayOfWeek: string): number[] {
    const index = this.daysOfWeek.findIndex((x) => x === dayOfWeek);
    return Array.from({ length: index }, (_, i) => i);
  }

  getEvents(date: ICalendarDate) {
    const { year, month } = this.calendarForm.getRawValue();
    let newMonth = (Number(this.month.findIndex((x) => x === month)) + 1).toString().padStart(2, '0');
    const day = date.date.toString().padStart(2, '0');
    const request = {
      isCalendar: true,
      dateFrom: `${year}-${newMonth}-${day}`,
    };
    this.reservationsList$ = this._apiBaseService
      .get(request, `${API_URL.reservation.reservation}`)
      .pipe(take(1));
  }

  getCurrentEvents() {
    const month = (this.currentMonth + 1).toString().padStart(2, '0');
    const day = this.currentDate.toString().padStart(2, '0');
    const request = {
      isCalendar: true,
      dateFrom: `${this.currentYear}-${month}-${day}`,
    };
    this.currentEventList$ = this._apiBaseService
      .get(request, `${API_URL.reservation.reservation}`)
      .pipe(take(1));
  }

  getUpcomingEvents() {
    const month = (this.currentMonth + 1).toString().padStart(2, '0');
    const day = (this.currentDate + 1).toString().padStart(2, '0');
    const request = {
      isCalendar: true,
      dateFrom: `${this.currentYear}-${month}-${day}`,
    };

    this.upcomingEventList$ = this._apiBaseService
      .get(request, `${API_URL.reservation.reservation}`)
      .pipe(take(1));
  }

  navigateReservationViewList() {
    this._router.navigateByUrl('/reservation');
  }

  generateDropdownYear() {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 20;
    const endYear = currentYear + 20;

    this.years = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    );
  }

  calendarForm: FormGroup;

  hasError(fieldName: string) {
    this.calendarForm.get(fieldName)?.hasError('required');
  }
  resetForm() {
    this.calendarForm = new FormGroup({
      year: new FormControl(this.currentYear),
      month: new FormControl(this.month[this.currentMonth]),
    });
  }

  loadReservationCountsForMonth(year?: number, month?: string) {
    // Use provided parameters or get from form
    const formValues = this.calendarForm.getRawValue();
    const selectedYear = year ?? formValues.year;
    const selectedMonth = month ?? formValues.month;
    const monthIndex = this.month.findIndex((x) => x === selectedMonth);
    
    // Get date range for the month
    const date = new Date(selectedYear, monthIndex, 1);
    const minDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const maxDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const startMonth = (monthIndex + 1).toString().padStart(2, '0');
    const startDay = minDate.getDate().toString().padStart(2, '0');
    const endMonth = (monthIndex + 1).toString().padStart(2, '0');
    const endDay = maxDate.getDate().toString().padStart(2, '0');
    
    const request = {
      dateFrom: `${selectedYear}-${startMonth}-${startDay}`,
      dateTo: `${selectedYear}-${endMonth}-${endDay}`,
    };
    
    this._apiBaseService
      .get(request, `${API_URL.reservation.reservation}`)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          this.reservationCounts.clear();
          
          // Handle both array response and paginated response with data property
          const reservations = Array.isArray(response) ? response : (response?.data || []);
          
          if (reservations && Array.isArray(reservations)) {
            reservations.forEach((reservation: any) => {
              if (reservation.dateFrom) {
                const dateFrom = new Date(reservation.dateFrom);
                const dateKey = `${dateFrom.getFullYear()}-${(dateFrom.getMonth() + 1).toString().padStart(2, '0')}-${dateFrom.getDate().toString().padStart(2, '0')}`;
                
                const currentCount = this.reservationCounts.get(dateKey) || 0;
                this.reservationCounts.set(dateKey, currentCount + 1);
              }
            });
          }
        },
        error: (error) => {
          console.error('Error loading reservation counts:', error);
        }
      });
  }

  getReservationCount(day: ICalendarDate): number {
    const { year } = this.calendarForm.getRawValue();
    const monthIndex = day.month;
    const dateKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.date.toString().padStart(2, '0')}`;
    return this.reservationCounts.get(dateKey) || 0;
  }
}
