import { Component, inject, OnInit } from '@angular/core';
import { BaseModule } from '../../../../shared/modules/base.module';
import { MatError } from '@angular/material/input';
import { formHandler } from '../../../../shared/handler/form.handler';
import { IIngredientForm } from '../../../../shared/models/file-maintenance/ingredients.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, switchMap, take } from 'rxjs';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';
import { MatSelectModule } from '@angular/material/select';
import { LookupService } from '../../../../shared/services/lookup.service';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-ingridient-form',
  imports: [BaseModule, MatError, MatSelectModule, MatDatepickerModule],
  templateUrl: './ingridient-form.component.html',
  styleUrl: './ingridient-form.component.scss',
})
export class IngridientFormComponent
  extends formHandler<IIngredientForm>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'Ingredients',
    ...this.actionType,
    headers: {
      name: 'Name',
      description: 'Description',
      qty: 'Quantity',
      um: 'Unit of Measurement',
      supplier: 'Supplier',
      purchaseDate: 'Purchase Date',
      expirationDate: 'Expiration Date',
    },
  };

  readonly supplierList$: Observable<{ id: number; value: string }[]>;
  readonly unitOfMeasurementList$: Observable<{ id: number; value: string }[]>;

  constructor(private readonly lookupService: LookupService) {
    super();

    this.supplierList$ = lookupService.getSupplierList();
    this.unitOfMeasurementList$ = lookupService.getUnitOfMeasurementList();
  }

  ngOnInit(): void {
    this.resetForm();
    this._activatedRoute.params
      .pipe(
        take(1),
        switchMap((param) => {
          const id = param?.id;

          return this.sync(MODULE.ingredients, { ingredientId: id } as any);
        })
      )
      .subscribe({
        next: (data: IIngredientForm) => {
          this.formGroup.patchValue({
            ingredientId: data.ingredientId,
            name: data.name,
            description: data.description,
            qty: data.qty,
            umId: data.umId,
            supplierId: data.supplierId,
            purchaseDate: new Date(data.purchaseDate),
            expirationDate: new Date(data.expirationDate),
          });

          this.defaultFormType = ACTION_TYPE.edit;
        },
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      ingredientId: new FormControl(),
      name: new FormControl('', Validators.required),
      description: new FormControl(''),
      qty: new FormControl('', Validators.required),
      umId: new FormControl('', Validators.required),
      supplierId: new FormControl('', Validators.required),
      purchaseDate: new FormControl('', Validators.required),
      expirationDate: new FormControl(''),
      updatedAt: new FormControl(),
    });
  }
}
