import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseModule } from '../../../../shared/modules/base.module';
import { PaginationModule } from '../../../../shared/modules/pagination.module';
import { PaginationHandler } from '../../../../shared/handler/pagination.handler';
import { IPaginationFilterBase } from '../../../../shared/models/required/pagination.model';
import { catchError, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { IUnitOfMeasurementList } from '../../../../shared/models/file-maintenance/unit-of-measurement.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiBaseService } from '../../../../shared/services/api-base.service';
import { API_URL } from '../../../../shared/constants/api.url.constant';
import { DEFAULT_PAGINATION } from '../../../../shared/constants/pagination.constant';

@Component({
  selector: 'app-unit-of-measurement-list',
  imports: [BaseModule, PaginationModule],
  templateUrl: './unit-of-measurement-list.component.html',
  styleUrl: './unit-of-measurement-list.component.scss'
})
export class UnitOfMeasurementListComponent
  extends PaginationHandler<IPaginationFilterBase>
  implements OnInit, OnDestroy
{
  unitOfMeasurementList$: Observable<IUnitOfMeasurementList>;
  private readonly _destroy$ = new Subject<void>();

  readonly labels = {
    headers: {
      abbr: 'Abbr',
      description: 'Description',
      createdAt: 'Created At',
      updatedAt: 'Update At',
      action: 'Actions',
    },
    placeholder: {
      search: 'Search',
      reset: 'Reset',
    },
    actions: {
      edit: 'Edit',
      delete:'Delete'
    },
    new: 'New',
  };

  constructor(
    private readonly _formBuilder: FormBuilder,
    readonly _apiService: ApiBaseService<IPaginationFilterBase, IUnitOfMeasurementList>
  ) {
    super(_apiService);
  }

  ngOnInit(): void {
    this.unitOfMeasurementList$ = this._apiService.filterParams$.pipe(
      takeUntil(this._destroy$),
      switchMap((params) => {
        if (params.isRefresh) {
          this.resetForm();
          params.isRefresh = false;
        }

        this.paginationFilter = params as IPaginationFilterBase;

        return this._apiService.get(
          this.paginationFilter,
          `${API_URL.fileMaintenance.unitOfMeasurement}`
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
        return of({
          data: null,
          ...DEFAULT_PAGINATION,
        } as IUnitOfMeasurementList);
      })
    );

    this.resetForm();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.resetFilter();
  }

  unitOfMeasurementFormGroup: FormGroup;

  resetForm() {
    this.unitOfMeasurementFormGroup = this._formBuilder.group({
      searchValue: new FormControl(),
    });
  }
}
