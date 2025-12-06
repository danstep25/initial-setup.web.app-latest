import { Component } from '@angular/core';
import { FoodPackageListComponent } from './food-package-list/food-package-list.component';

@Component({
  selector: 'app-food-package',
  imports: [FoodPackageListComponent],
  templateUrl: './food-package.component.html',
  styleUrl: './food-package.component.scss',
})
export class FoodPackageComponent {
  readonly labels = {
    title: 'Food Packages',
  };
}
