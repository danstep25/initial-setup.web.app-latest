import { Component } from '@angular/core';
import { DishesListComponent } from './dishes-list/dishes-list.component';

@Component({
  selector: 'app-dishes',
  imports: [DishesListComponent],
  templateUrl: './dishes.component.html',
  styleUrl: './dishes.component.scss',
})
export class DishesComponent {
  readonly labels = {
    title: 'Food Menu',
  };
}
