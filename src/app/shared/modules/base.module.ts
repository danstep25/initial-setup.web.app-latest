import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIcon,
    MatFormField,
    MatInputModule,
    MatButtonModule,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIcon,
    MatFormField,
    MatInputModule,
    MatButtonModule
  ]
})
  
export class BaseModule { }import { from } from 'rxjs';

