import { Component } from '@angular/core';
import { ServiceListComponent } from './service-list/service-list.component';

@Component({
  selector: 'app-service',
  imports: [ServiceListComponent],
  templateUrl: './service.component.html',
  styleUrl: './service.component.scss',
})
export class ServiceComponent {
  readonly labels = {
    title: 'Service',
  };
}
