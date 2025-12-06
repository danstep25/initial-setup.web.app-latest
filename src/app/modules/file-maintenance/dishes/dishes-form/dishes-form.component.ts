import { Component, inject, OnInit } from '@angular/core';
import { formHandler } from '../../../../shared/handler/form.handler';
import { IDishesForm } from '../../../../shared/models/file-maintenance/dishes.model';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Observable, switchMap, take } from 'rxjs';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';
import { BaseModule } from '../../../../shared/modules/base.module';
import { MatError } from '@angular/material/input';
import { LookupService } from '../../../../shared/services/lookup.service';
import { MatSelectModule } from '@angular/material/select';
import { C } from "../../../../../../node_modules/@angular/cdk/overlay-module.d-BvvR6Y05";

@Component({
  selector: 'app-dishes-form',
  imports: [BaseModule, MatError, MatSelectModule],
  templateUrl: './dishes-form.component.html',
  styleUrl: './dishes-form.component.scss',
})
export class DishesFormComponent
  extends formHandler<IDishesForm>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'Food Menu',
    ...this.actionType,
    headers: {
      name: 'Name',
      description: 'Description',
      ingredients: 'Ingredients',
      category: 'Category',
      quantity: 'Quantity',
      price: 'Price'
    },
  };

  readonly categoryList$: Observable<{ id: number; value: string }[]>;
  readonly ingredientList$: Observable<{ id: number; value: string }[]>;

  constructor(private readonly _LookupService: LookupService) {
    super();

    this.categoryList$ = _LookupService.getCategoryList();
    this.ingredientList$ = _LookupService.getIngredientList();
  }
  ngOnInit(): void {
    this.resetForm();
    this._activatedRoute.params
      .pipe(
        take(1),
        switchMap((param) => {
          const id = param?.id;

          return this.sync(MODULE.dish, { dishId: id } as any);
        })
      )
      .subscribe({
        next: (data: IDishesForm) => {
          this.formGroup.patchValue({
            dishId: data.dishId,
            name: data.name,
            description: data.description,
            categoryId: data.categoryId,
            price: data.price,
          });
          // data.ingredients.forEach(items =>
          //   this.Ingredients.push(this.newIngredient(items))
          // )
          this.defaultFormType = ACTION_TYPE.edit;
        },
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      dishId: new FormControl(),
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      ingredients: new FormArray([]),
      categoryId: new FormControl('', Validators.required),
      price: new FormControl('', Validators.required),
      updatedAt: new FormControl(),
    });
  }

  get Ingredients(): FormArray {
    return this.formGroup.get('ingredients') as FormArray;
  }

  private newIngredient(item?) {
    return new FormGroup({
      ingredientId: new FormControl(item?.ingredientId, Validators.required),
      qty: new FormControl(item?.qty, Validators.required),
    });
  }

  addIngredient() {
    this.Ingredients.push(this.newIngredient());
  }

  removeIngredient(index: number) {
    this.Ingredients.removeAt(index);
  }
}
