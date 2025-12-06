import { Component, inject, OnInit } from '@angular/core';
import { formHandler } from '../../../../shared/handler/form.handler';
import { IServiceForm } from '../../../../shared/models/file-maintenance/service.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { switchMap, take } from 'rxjs';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';
import { BaseModule } from '../../../../shared/modules/base.module';
import { MatError } from '@angular/material/input';

@Component({
  selector: 'app-service-form',
  imports: [BaseModule, MatError],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.scss',
})
export class ServiceFormComponent
  extends formHandler<IServiceForm>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'Services',
    ...this.actionType,
    headers: {
      name: 'Name',
      description: 'Description',
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

          return this.sync(MODULE.service, { serviceId: id } as any);
        })
      )
      .subscribe({
        next: (data: IServiceForm) => {
          this.formGroup.patchValue({
            serviceId: data?.serviceId,
            description: data.description,
            price: data.price,
          });

          this.defaultFormType = ACTION_TYPE.edit;
        },
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      serviceId: new FormControl(),
      description: new FormControl('', Validators.required),
      price: new FormControl('', Validators.required),
      updatedAt: new FormControl(),
    });
  }
}