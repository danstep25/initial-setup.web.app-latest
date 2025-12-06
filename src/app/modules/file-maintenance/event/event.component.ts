import { Component } from '@angular/core';
import { EventListComponent } from './event-list/event-list.component';

@Component({
  selector: 'app-event',
  imports: [EventListComponent],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss',
})
export class EventComponent {
  readonly labels = {
    title: 'Event',
  };
}
