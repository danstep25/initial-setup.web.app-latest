import { Component, inject, OnInit } from '@angular/core';
import { formHandler } from '../../../../shared/handler/form.handler';
import { ICategoryForm } from '../../../../shared/models/file-maintenance/category.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { switchMap, take } from 'rxjs';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';
import { BaseModule } from '../../../../shared/modules/base.module';
import { MatError } from '@angular/material/input';

@Component({
  selector: 'app-category-form',
  imports: [BaseModule, MatError],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent
  extends formHandler<ICategoryForm>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'Categories',
    ...this.actionType,
    headers: {
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
          const id = param?.id;

          return this.sync(MODULE.category, { categoryId: id } as any);
        })
      )
      .subscribe({
        next: (data: ICategoryForm) => {
          this.formGroup.patchValue({
            categoryId: data.categoryId,
            description: data.description,
          });

          this.defaultFormType = ACTION_TYPE.edit;
        },
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      categoryId: new FormControl(),
      description: new FormControl('', Validators.required),
      updatedAt: new FormControl(),
    });
  }
}
