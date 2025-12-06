import { Component } from '@angular/core';
import { ReservationListCalendarComponent } from '../reservation-list-calendar/reservation-list-calendar.component';
import { BaseModule } from '../../../shared/modules/base.module';

@Component({
  selector: 'app-reservation-calendar',
  imports: [ReservationListCalendarComponent, BaseModule],
  templateUrl: './reservation-calendar.component.html',
  styleUrl: './reservation-calendar.component.scss',
})
export class ReservationCalendarComponent {
  readonly labels = {
    title: 'Reservations',
  };
}
