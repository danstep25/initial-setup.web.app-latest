import { Injectable, OnDestroy, inject } from '@angular/core';
import { ACTION_TYPE } from '../constants/action.constant';
import { EMPTY, map, Subject, take } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ApiBaseService } from '../services/api-base.service';
import { METHOD, MODULE } from '../constants/module.constant';
import { RequestHandler } from './api-request.handler';
import { ToastService } from '../services/toast.service';
import { TOAST_TYPE } from '../constants/icon.constant';
import { ActivatedRoute, Router } from '@angular/router';
import { IResponse } from '../models/required/pagination.model';
import { PermissionService } from '../services/permission.service';
import { AuditService } from '../services/audit.service';

@Injectable({
  providedIn: 'root',
})
export class formHandler<TRequest> implements OnDestroy {
  readonly destroy$ = new Subject<void>();
  protected defaultFormType = ACTION_TYPE.add;
  readonly actionType = ACTION_TYPE;
  readonly module = MODULE;
  readonly requestMethod = METHOD;
  private readonly _permissionService = inject(PermissionService);
  private readonly _toastService = inject(ToastService);
  private readonly _apiService = inject(ApiBaseService<TRequest>);
  private readonly _router = inject(Router);
  protected readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _auditService = inject(AuditService);
  protected dateNow = new Date().toISOString();
  formGroup: FormGroup;

  constructor() {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected hasError(fieldName: string) {
    if (fieldName) {
      return this.formGroup.get(`${fieldName}`)?.hasError('required');
    }

    return false;
  }

  protected sync(module: MODULE, request: TRequest) {
    const apiUrl = RequestHandler.getAPI(module, METHOD.get);

    return this._apiService
      .get(request, apiUrl)
      .pipe(map((data) => data?.data));
  }

  protected submit(module: MODULE, method: METHOD) {
    if (this.isValid()) {
      if (method === METHOD.put) {
        this.formGroup.get('updatedAt').setValue(this.dateNow);
      }

      return this._apiService
        .set(
          this.formGroup.getRawValue() as TRequest,
          RequestHandler.getAPI(module, method)
        )
        .pipe(take(1))
        .subscribe({
          next: (response: IResponse) => {
            this._toastService.show(TOAST_TYPE.success, response.message);
            const { username } = JSON.parse(sessionStorage.getItem('userInfo'));
            const action = method === METHOD.put ? 'Update' : 'Create';

            this._auditService.log({
              username: username,
              action: action,
              module: module,
              description: this.formGroup.getRawValue(),
            });

            return new RequestHandler(this._router).returnMainModule(module);
          },
          error: (error: string) => {
            this._toastService.show(TOAST_TYPE.error, error);
            return EMPTY;
          },
        });
    }
  }

  private isValid() {
    if (this.formGroup.invalid) {
      this.formGroup.dirty;
      return false;
    }

    return true;
  }

  hasPermission() {
    return this._permissionService.hasPermission();
  }
  
  onlyAllowDecimal(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const key = event.key;

    // Allow control keys (Backspace, Tab, Delete, Arrow keys)
    if (
      ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(key)
    ) {
      return;
    }

    // Allow only digits and one decimal point
    if (!/[0-9.]/.test(key)) {
      event.preventDefault();
      return;
    }

    // Prevent multiple decimals
    if (key === '.' && value.includes('.')) {
      event.preventDefault();
      return;
    }

    // Limit to 2 decimal places
    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1) {
      const decimals = value.substring(decimalIndex + 1);
      const cursorPos = input.selectionStart ?? value.length;
      // If cursor is after the decimal and already 2 digits exist → block input
      if (cursorPos > decimalIndex && decimals.length >= 2) {
        event.preventDefault();
      }
    }
  }

  onPasteDecimal(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';
    // Allow only numbers with up to 2 decimal places
    if (!/^\d+(\.\d{0,2})?$/.test(pasted)) {
      event.preventDefault();
    }
  }
}
