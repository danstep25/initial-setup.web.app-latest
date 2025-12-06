import { Component, inject, OnInit } from '@angular/core';
import { formHandler } from '../../../../shared/handler/form.handler';
import { IFoodPackageForm } from '../../../../shared/models/file-maintenance/food-package.model';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, Observable, of, startWith, switchMap, take } from 'rxjs';
import { LookupService } from '../../../../shared/services/lookup.service';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';
import { BaseModule } from '../../../../shared/modules/base.module';
import { MatError } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IResponse } from '../../../../shared/models/required/pagination.model';

@Component({
  selector: 'app-food-package-form',
  imports: [BaseModule, MatError, MatSelectModule, MatCheckboxModule],
  templateUrl: './food-package-form.component.html',
  styleUrl: './food-package-form.component.scss',
})
export class FoodPackageFormComponent
  extends formHandler<IFoodPackageForm>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'Food Packages',
    ...this.actionType,
    headers: {
      name: 'Name',
      description: 'Description',
      dishes: 'Dishes',
      category: 'Category',
      servingSize: 'Serving Size',
      pax: 'Pax',
      price: 'Price',
    },
  };

  readonly servingSize = [
    'small',
    'medium',
    'large',
    'x-large',
  ]
  readonly dishList$: Observable<{ id: number; value: string }[]>;

  constructor(private readonly _LookupService: LookupService) {
    super();

    this.dishList$ = _LookupService.getDishList();
  }
  ngOnInit(): void {
    this.resetForm();
    this.isAutoCompute();
    this._activatedRoute.params
      .pipe(
        take(1),
        switchMap((param) => {
          const id = param?.id;

          return this.sync(MODULE.foodPackage, { foodPackageId: id } as any);
        })
      )
      .subscribe({
        next: (data: IFoodPackageForm) => {
          this.formGroup.patchValue({
            foodPackageId: data.foodPackageId,
            name: data.name,
            description: data.description,
            pax: data?.pax,
            price: data.price,
          });
          data?.dishes?.forEach((items, i) => {
            this.Dishes.push(this.newDish(items))
            this.getPrice(items.dishId, i)
          });

          this.defaultFormType = ACTION_TYPE.edit;
        },
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      foodPackageId: new FormControl(),
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      pax: new FormControl('', Validators.required),
      dishes: new FormArray([]),
      price: new FormControl('', Validators.required),
      updatedAt: new FormControl(),
      isFixed: new FormControl(true),
    });
  }

  get Dishes(): FormArray {
    return this.formGroup.get('dishes') as FormArray;
  }

  private newDish(item?) {
    return new FormGroup({
      dishId: new FormControl(item?.dishId, Validators.required),
      price: new FormControl(
        { value: item?.price, disabled: true },
        Validators.required
      ),
      servingSize: new FormControl(item?.servingSize, Validators.required),
    });
  }

  addDish() {
    this.Dishes.push(this.newDish());
  }

  removeDish(index: number) {
    this.Dishes.removeAt(index);
  }

  isAutoCompute() {
    const { isFixed, price } = this.formGroup.controls;
    isFixed.valueChanges
      .pipe(startWith(isFixed.getRawValue()))
      .subscribe((isActive) => {
      if (isActive) {
        price.disable();

        const totalPrices = this.Dishes.controls
          .reduce((sum, ctrl) => sum + Number(ctrl.get('price')?.value || 0), 0);
        
        price.setValue(totalPrices)
        return;
      }

      price.enable();
    });
  }

  getPrice(packageId: number, index: number) {
    this.dishList$
      .pipe(
        take(1),
        map((data:any)=> data.data)
      )
      .subscribe((packages:any[]) => {
        const value = packages.find((value: any) => value.id === packageId)?.price;
        this.Dishes.at(index).get('price').setValue(value);
        this.isAutoCompute();
      });
  }
}
