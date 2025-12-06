import { Component } from '@angular/core';
import { SupplierListComponent } from './supplier-list/supplier-list.component';

@Component({
  selector: 'app-supplier',
  imports: [SupplierListComponent],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.scss',
})
export class SupplierComponent {
  readonly labels = {
    title: 'Suppliers',
  };
}
