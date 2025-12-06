import { Component } from '@angular/core';
import { IngredientsListComponent } from './ingredients-list/ingredients-list.component';

@Component({
  selector: 'app-ingredients',
  imports: [IngredientsListComponent],
  templateUrl: './ingredients.component.html',
  styleUrl: './ingredients.component.scss',
})
export class IngredientsComponent {
  readonly labels = {
    title: 'Ingredients',
  };
}
