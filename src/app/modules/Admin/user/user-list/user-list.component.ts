import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginationModule } from '../../../../shared/modules/pagination.module';
import { BaseModule } from '../../../../shared/modules/base.module';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UserService } from '../user.service';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { IUserList } from '../../../../shared/models/admin/user.model';
import { PaginationHandler } from '../../../../shared/handler/pagination.handler';
import { IPaginationFilterBase } from '../../../../shared/models/required/pagination.model';
import { ApiBaseService } from '../../../../shared/services/api-base.service';
import { API_URL } from '../../../../shared/constants/api.url.constant';
import { DEFAULT_PAGINATION } from '../../../../shared/constants/pagination.constant';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ExportService } from '../../../../shared/services/export.service';
import { take } from 'rxjs';
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [BaseModule, PaginationModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent
  extends PaginationHandler<IPaginationFilterBase>
  implements OnInit, OnDestroy
{
  private readonly _destroy$ = new Subject<void>();
  readonly labels = {
    title: 'User',
    headers: {
      search: 'Search',
      reset: 'Reset',
      username: 'Username',
      password: 'Password',
      role: 'Role',
      fullname: 'Name',
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
      delete: 'Delete',
    },
    new: 'New',
    generate: 'Generate',
  };

  userList$: Observable<IUserList>;
  constructor(
    private readonly _userService: UserService,
    private readonly _formBuilder: FormBuilder,
    readonly _apiService: ApiBaseService<
      IPaginationFilterBase,
      IUserList
    >,
    private readonly _exportService: ExportService
  ) {
    super(_apiService);
  }

  ngOnInit(): void {
    this.userList$ = this._apiService.filterParams$.pipe(
      takeUntil(this._destroy$),
      switchMap((params) => {
        if (params.isRefresh) {
          this.resetForm();
          params.isRefresh = false;
        }

        this.paginationFilter = params as IPaginationFilterBase;

        return this._apiService.get(
          this.paginationFilter,
          `${API_URL.admin.user}`
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
        return of({ data: null, ...DEFAULT_PAGINATION } as IUserList);
      })
    );
    
    this.resetForm();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.resetFilter();
  }

  userFormGroup: FormGroup;

  resetForm() {
    this.userFormGroup = this._formBuilder.group({
      searchValue: new FormControl(),
    });
  }

  setDeactivated(isDeactivated: string){
    return {
      tooltip: isDeactivated === '0' ? 'Deactivate': 'Activate',
      class: isDeactivated === '0' ? 'text-black hover:text-red-300' : 'text-black hover:text-green-300',
      icon: isDeactivated === '0' ? 'account_circle_off' : 'account_circle'
    }
  }

  deactivate(request){
    this._userService
    .deactiavateUser(request)
    .pipe(takeUntil(this._destroy$))
    .subscribe(() => this.resetFilter());
  }

  openDeleteConfirmation(request: any, name?: string, username?: string): void {
    const message = username 
      ? `Are you sure you want to delete ${username}? This action cannot be undone.`
      : `Are you sure you want to delete ${name || 'this user'}? This action cannot be undone.`;
    
    super.openDeleteConfirmation(request, MODULE.user, name || username, message);
  }

  generate(){
    this._userService.generate()
    .pipe(take(1))
    .subscribe((response: any)=>{
      const result = response.data;
      this._exportService.exportToPdf(result, 'users.pdf', MODULE.user);
    });
  }
}
