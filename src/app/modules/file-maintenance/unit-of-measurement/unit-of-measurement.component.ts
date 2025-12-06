import { Component } from '@angular/core';
import { UnitOfMeasurementListComponent } from './unit-of-measurement-list/unit-of-measurement-list.component';

@Component({
  selector: 'app-unit-of-measurement',
  imports: [UnitOfMeasurementListComponent],
  templateUrl: './unit-of-measurement.component.html',
  styleUrl: './unit-of-measurement.component.scss',
})
export class UnitOfMeasurementComponent {
  readonly labels = {
    title: 'Unit Of Measurements',
  };
}
