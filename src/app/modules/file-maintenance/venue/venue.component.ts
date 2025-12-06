import { Component } from '@angular/core';
import { VenueListComponent } from './venue-list/venue-list.component';

@Component({
  selector: 'app-venue',
  imports: [VenueListComponent],
  templateUrl: './venue.component.html',
  styleUrl: './venue.component.scss',
})
export class VenueComponent {
  readonly labels = {
    title: 'Venues',
  };
}
