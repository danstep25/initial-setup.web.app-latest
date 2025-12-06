import { Component, inject, OnInit } from '@angular/core';
import { formHandler } from '../../../../shared/handler/form.handler';
import { IUnitOfMeasurementForm } from '../../../../shared/models/file-maintenance/unit-of-measurement.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { switchMap, take } from 'rxjs';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';
import { BaseModule } from '../../../../shared/modules/base.module';
import { MatError } from '@angular/material/input';

@Component({
  selector: 'app-unit-of-measurement-form',
  imports: [BaseModule, MatError],
  templateUrl: './unit-of-measurement-form.component.html',
  styleUrl: './unit-of-measurement-form.component.scss',
})
export class UnitOfMeasurementFormComponent
  extends formHandler<IUnitOfMeasurementForm>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'Unit Of Measurement',
    ...this.actionType,
    headers: {
      abbr: 'Abbr',
      description: 'Description',
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

          return this.sync(MODULE.unitOfMeasurement, { id: id } as any);
        })
      )
      .subscribe({
        next: (data: IUnitOfMeasurementForm) => {
          this.formGroup.patchValue({
            id: data.id,
            abbr: data.abbr,
            description: data.description,
          });

          this.defaultFormType = ACTION_TYPE.edit;
        },
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      id: new FormControl(),
      abbr: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      updatedAt: new FormControl(),
    });
  }
}