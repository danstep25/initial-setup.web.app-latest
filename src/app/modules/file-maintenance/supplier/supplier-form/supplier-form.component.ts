import { Component, inject, OnInit } from '@angular/core';
import { formHandler } from '../../../../shared/handler/form.handler';
import { ISupplierForm } from '../../../../shared/models/file-maintenance/supplier.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { switchMap, take } from 'rxjs';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';
import { BaseModule } from '../../../../shared/modules/base.module';
import { MatError } from '@angular/material/input';

@Component({
  selector: 'app-supplier-form',
  imports: [BaseModule, MatError],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss',
})
export class SupplierFormComponent
  extends formHandler<ISupplierForm>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'Supplier',
    ...this.actionType,
    headers: {
      name: 'Supplier Name',
      description: 'Supply Description',
      address: 'Address',
      contact: 'Contact No.',
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

          return this.sync(MODULE.supplier, { supplierId: id } as any);
        })
      )
      .subscribe({
        next: (data: ISupplierForm) => {
          this.formGroup.patchValue({
            supplierId: data.supplierId,
            name: data.name,
            description: data.description,
            address: data.address,
            contact: data.contact,
          });

          this.defaultFormType = ACTION_TYPE.edit;
        },
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      supplierId: new FormControl(),
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      contact: new FormControl('', Validators.required),
      updatedAt: new FormControl(),
    });
  }
}
