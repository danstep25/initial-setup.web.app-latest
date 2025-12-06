import { DEFAULT_PAGINATION } from '../constants/pagination.constant';
import { ApiBaseService } from '../services/api-base.service';
import {
  IPaginationFilterBase,
  IResponse,
} from '../models/required/pagination.model';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup } from '@angular/forms';
import { DATE_FORMAT } from '../constants/date.constant';
import { METHOD, MODULE } from '../constants/module.constant';
import { RequestHandler } from './api-request.handler';
import { Inject, inject, Injectable } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { TOAST_TYPE } from '../constants/icon.constant';
import { EMPTY, Subject } from 'rxjs';
import { PermissionService } from '../services/permission.service';
import { AuditService } from '../services/audit.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../component/confirmation-dialog/confirmation-dialog.component';

export class PaginationHandler<TRequest> {
  paginate = {
    ...DEFAULT_PAGINATION,
  };
  dateFormat = DATE_FORMAT;
  module = MODULE;

  paginationFilter: IPaginationFilterBase;

  private _permissionService = inject(PermissionService);
  private _toastService = inject(ToastService);
  private _auditService = inject(AuditService);
  protected _dialog = inject(MatDialog);
  constructor(readonly _apiService: ApiBaseService) {}

  handlePageEvent(pageEvent: PageEvent): void {
    this.paginationFilter.pageIndex = pageEvent.pageIndex;
    this.paginationFilter.pageSize = pageEvent.pageSize;
    this._apiService.paginationFilter(this.paginationFilter);
  }

  searchFilter(form: FormGroup): void {
    this.paginationFilter = {
      ...this.paginate,
      ...form.getRawValue(),
    } as IPaginationFilterBase;

    this._apiService.paginationFilter(this.paginationFilter);
  }

  resetFilter(): void {
    this.paginationFilter = {
      ...DEFAULT_PAGINATION,
    };

    this.paginationFilter.isRefresh = true;
    this._apiService.paginationFilter(this.paginationFilter);
  }

  delete(request: any, module: MODULE, name?: string) {
    this._apiService
      .set(request as TRequest, RequestHandler.getAPI(module))
      .subscribe({
        next: (response: IResponse) => {
          this._toastService.show(TOAST_TYPE.success, response.message);

          const { username } = JSON.parse(sessionStorage.getItem('userInfo'));
          this._auditService.log({
            username: username,
            action: 'Delete',
            module: module,
            description: name,
          });

          return this.resetFilter();
        },
        error: (error: string) => {
          this._toastService.show(TOAST_TYPE.error, error);
          return EMPTY;
        },
      });
  }

  openDeleteConfirmation(
    request: any,
    module: MODULE,
    name?: string,
    customMessage?: string
  ): void {
    const message = customMessage || `Are you sure you want to delete this item? This action cannot be undone.`;
    
    const dialogData: ConfirmationDialogData = {
      title: 'Confirm Delete',
      message: message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    const dialogRef = this._dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.delete(request, module, name);
      }
    });
  }

  getDataName(obj: any){
    const keys = Object.keys(obj);
    const secondKey = keys[1];
    return `${secondKey}= ${obj[secondKey]}`;
  }

  hasPermission() {
    return this._permissionService.hasPermission();
  }
}
