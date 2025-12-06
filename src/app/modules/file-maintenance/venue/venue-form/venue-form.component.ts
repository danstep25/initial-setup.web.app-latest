import { Component, inject, OnInit } from '@angular/core';
import { BaseModule } from '../../../../shared/modules/base.module';
import { formHandler } from '../../../../shared/handler/form.handler';
import { IVenueForm } from '../../../../shared/models/file-maintenance/venue.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { switchMap, take } from 'rxjs';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';

@Component({
  selector: 'app-venue-form',
  imports: [BaseModule],
  templateUrl: './venue-form.component.html',
  styleUrl: './venue-form.component.scss',
})
export class VenueFormComponent
  extends formHandler<IVenueForm>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'Venue',
    ...this.actionType,
    headers: {
      name: 'Name',
      price: 'Price',
    },
  };

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.resetForm();
    this._activatedRoute.params
      .pipe(
        take(1),
        switchMap((param) => {
          const id = param.id;

          return this.sync(MODULE.venue, { venueId: id } as any);
        })
      )
      .subscribe({
        next: (data: IVenueForm) => {
          this.formGroup.patchValue({
            venueId: data.venueId,
            name: data.name,
            price: data.price
          });

          this.defaultFormType = ACTION_TYPE.edit;
        },
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      venueId: new FormControl(),
      name: new FormControl('', Validators.required),
      price: new FormControl('', Validators.required),
      updatedAt: new FormControl(),
    });
  }
}