import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSortModule } from '@angular/material/sort';
import { PaginatorComponent } from '../component/paginator/paginator.component';
import { RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatExpansionModule,
    MatSortModule,
    PaginatorComponent,
    RouterLink,
    MatTooltipModule,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatExpansionModule,
    MatSortModule,
    PaginatorComponent,
    RouterLink,
    MatTooltipModule,
  ],
})
export class PaginationModule {}
