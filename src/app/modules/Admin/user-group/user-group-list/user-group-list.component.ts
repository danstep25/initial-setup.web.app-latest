import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseModule } from '../../../../shared/modules/base.module';
import { PaginationModule } from '../../../../shared/modules/pagination.module';
import { PaginationHandler } from '../../../../shared/handler/pagination.handler';
import { IPaginationFilterBase } from '../../../../shared/models/required/pagination.model';
import { catchError, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { IUserGroupList } from '../../../../shared/models/admin/usergroup.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiBaseService } from '../../../../shared/services/api-base.service';
import { API_URL } from '../../../../shared/constants/api.url.constant';
import { DEFAULT_PAGINATION } from '../../../../shared/constants/pagination.constant';

@Component({
  selector: 'app-user-group-list',
  imports: [BaseModule, PaginationModule],
  templateUrl: './user-group-list.component.html',
  styleUrl: './user-group-list.component.scss',
})
export class UserGroupListComponent
  extends PaginationHandler<IPaginationFilterBase>
  implements OnInit, OnDestroy
{
  private readonly _destroy$ = new Subject<void>();
  readonly labels = {
    title: 'User Groups',
    headers: {
      search: 'Search',
      reset: 'Reset',
      abbr: 'Abbr',
      description: 'Description',
      createdAt: 'Created At',
      updatedAt: 'Updated At',
      action: 'Actions',
    },
    placeholder: {
      search: 'Search',
      reset: 'Reset',
    },
    actions: {
      edit: 'Edit',
    },
    new: 'New',
  };

  userGroupList$: Observable<IUserGroupList>;
  constructor(
    private readonly _formBuilder: FormBuilder,
    readonly _apiService: ApiBaseService<IPaginationFilterBase, IUserGroupList>
  ) {
    super(_apiService);
  }

  ngOnInit(): void {

    this.userGroupList$ = this._apiService.filterParams$.pipe(
      takeUntil(this._destroy$),
      switchMap((params) => {
        if (params.isRefresh) {
          this.resetForm();
          params.isRefresh = false;
        }

        this.paginationFilter = params as IPaginationFilterBase;
        
        return this._apiService.get(
          this.paginationFilter,
          `${API_URL.admin.userGroup}`
        );
      }),

      tap(({ pageIndex, pageSize, totalRecords, totalPages }) => {
        Object.assign(this.paginate, {
          pageIndex,
          pageSize,
          totalRecords,
          totalPages,
        });
      }),
      catchError(() => {
        return of({ data: null, ...DEFAULT_PAGINATION } as IUserGroupList);
      })
    );

    this.resetForm();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.resetFilter();
  }

  userGroupFormGroup: FormGroup;

  resetForm() {
    this.userGroupFormGroup = this._formBuilder.group({
      searchValue: new FormControl(),
    });
  }
}
