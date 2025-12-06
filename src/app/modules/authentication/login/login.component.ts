import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BaseModule } from '../../../shared/modules/base.module';
import { Router } from '@angular/router';
import { ToastService } from '../../../shared/services/toast.service';
import { IResponse } from '../../../shared/models/required/pagination.model';
import { IUserAuthenticationRequest } from '../../../shared/models/admin/user.model';
import { TOAST_TYPE } from '../../../shared/constants/icon.constant';
import { catchError, EMPTY } from 'rxjs';
import { AuthServiceService } from '../../../shared/services/auth-service.service';
import { ROUTES } from '../../../shared/constants/module.routes.constant';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [BaseModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  ngOnInit(): void {
    this.resetForm();
  }

  constructor(
    private readonly _loginService: LoginService,
    private readonly _formBuilder: FormBuilder,
    private readonly _router: Router,
    private readonly _toastService: ToastService,
    private readonly _authService: AuthServiceService
  ) {}

  loginForm: FormGroup;

  resetForm() {
    this.loginForm = this._formBuilder.group({
      username: new FormControl(),
      password: new FormControl(),
    });
  }

  login() {
    this._loginService
      .login(this.loginForm.getRawValue() as IUserAuthenticationRequest)
      .pipe(catchError((error: string) => {
        this._toastService.show(TOAST_TYPE.error, error)
        return EMPTY;
      }))
      .subscribe((response: IResponse) =>
      {
        if (response.code === 200) {
          this._router.navigateByUrl(ROUTES.dashboard);
          this._toastService.show(TOAST_TYPE.success);
          this._authService.login(response.data);
        }
      });
  }
}
