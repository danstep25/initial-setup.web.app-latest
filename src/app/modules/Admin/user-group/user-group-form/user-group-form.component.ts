import { Component, inject, OnInit } from '@angular/core';
import { BaseModule } from '../../../../shared/modules/base.module';
import { MatError } from '@angular/material/input';
import { formHandler } from '../../../../shared/handler/form.handler';
import { IUserGroupForm, IUserGroupRequest } from '../../../../shared/models/admin/usergroup.model';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { switchMap, take } from 'rxjs';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';

@Component({
  selector: 'app-user-group-form',
  imports: [BaseModule, MatError],
  templateUrl: './user-group-form.component.html',
  styleUrl: './user-group-form.component.scss',
})
export class UserGroupFormComponent
  extends formHandler<IUserGroupRequest>
  implements OnInit
{
  formBuilder = inject(FormBuilder);

  readonly labels = {
    title: 'User Group',
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

          return this.sync(MODULE.userGroup, { userGroupId: id } as any);
        })
      )
      .subscribe({
        next: (data: IUserGroupForm) => {
          this.formGroup.patchValue({
            userGroupId: data.userGroupId,
            abbr: data.abbr,
            description: data.description
          });

          this.defaultFormType = ACTION_TYPE.edit;
        },
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      userGroupId: new FormControl(),
      abbr: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      updatedAt: new FormControl(),
    });
  }
}
