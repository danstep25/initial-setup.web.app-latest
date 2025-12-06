import { Component, inject, OnInit } from '@angular/core';
import { formHandler } from '../../../../shared/handler/form.handler';
import { IEventForm } from '../../../../shared/models/file-maintenance/event.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, switchMap, take } from 'rxjs';
import { LookupService } from '../../../../shared/services/lookup.service';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';
import { BaseModule } from '../../../../shared/modules/base.module';
import { MatError } from '@angular/material/input';

@Component({
  selector: 'app-event-form',
  imports: [BaseModule, MatError],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.scss',
})
export class EventFormComponent
  extends formHandler<IEventForm>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'Events',
    ...this.actionType,
    headers: {
      name: 'Name',
      description: 'Event Type',
      ingredients: 'Ingredients',
      category: 'Category',
      quantity: 'Quantity',
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
          const id = param?.id;

          return this.sync(MODULE.event, { eventId: id } as any);
        })
      )
      .subscribe({
        next: (data: IEventForm) => {
          this.formGroup.patchValue({
            eventId: data?.eventId,
            description: data.description,
          });

          this.defaultFormType = ACTION_TYPE.edit;
        },
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      eventId: new FormControl(),
      description: new FormControl('', Validators.required),
      updatedAt: new FormControl(),
    });
  }
}