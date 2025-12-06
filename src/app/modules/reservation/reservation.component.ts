import { Component } from '@angular/core';
import { ReservationListCalendarComponent } from './reservation-list-calendar/reservation-list-calendar.component';
import { ReservationListComponent } from './reservation-list/reservation-list.component';

@Component({
  selector: 'app-reservation',
  imports: [ReservationListComponent],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss',
})
export class ReservationComponent {
  readonly labels = {
    title: 'Reservations',
  };
}
