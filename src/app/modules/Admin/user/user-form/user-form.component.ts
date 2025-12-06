import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatError } from '@angular/material/form-field';
import { switchMap, take } from 'rxjs';
import { ACTION_TYPE } from '../../../../shared/constants/action.constant';
import { MODULE } from '../../../../shared/constants/module.constant';
import { formHandler } from '../../../../shared/handler/form.handler';
import { IUserForm, IUserRequest } from '../../../../shared/models/admin/user.model';
import { BaseModule } from '../../../../shared/modules/base.module';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [BaseModule, MatError, MatSelectModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
  
export class UserFormComponent extends formHandler<IUserRequest> implements OnInit {
  formBuilder = inject(FormBuilder);

  readonly roles = ['admin', 'staff']

  readonly labels = {
    title: 'User',
    ...this.actionType,
    headers: {
      username: 'Username',
      password: 'Password',
      firstName: 'First Name',
      middleName: 'Middle Name (Optional)',
      lastName: 'Last Name',
      suffix: 'Suffix (Optional)',
      role: 'Role'
    }
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

        return this.sync(MODULE.user, { userId: id } as any)
      }))
      .subscribe({
        next: (data: IUserForm) => {
          this.formGroup.patchValue({
            userId: data.userId,
            username: data.username,
            password: data.password,
            firstname: data.firstname,
            middlename: data.middlename,
            lastname: data.lastname,
            suffix: data.suffix,
            role: data.role
          })

          this.defaultFormType = ACTION_TYPE.edit;
        }
      });
  }

  resetForm() {
    this.formGroup = this.formBuilder.group({
      userId: new FormControl(),
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      firstname: new FormControl('', Validators.required),
      middlename: new FormControl(),
      lastname: new FormControl('', Validators.required),
      suffix: new FormControl(),
      role: new FormControl('', Validators.required),
      updatedAt: new FormControl(),
    });
  }
}
