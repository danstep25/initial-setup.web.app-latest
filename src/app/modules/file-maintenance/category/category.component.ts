import { Component } from '@angular/core';
import { CategoryListComponent } from './category-list/category-list.component';

@Component({
  selector: 'app-category',
  imports: [CategoryListComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent {
  readonly labels = {
    title: 'Categories',
  };
}
