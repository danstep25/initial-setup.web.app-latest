import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiBaseService } from '../../../../shared/services/api-base.service';
import { IPaginationFilterBase } from '../../../../shared/models/required/pagination.model';
import { IServiceList } from '../../../../shared/models/file-maintenance/service.model';
import { PaginationHandler } from '../../../../shared/handler/pagination.handler';
import { catchError, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { API_URL } from '../../../../shared/constants/api.url.constant';
import { DEFAULT_PAGINATION } from '../../../../shared/constants/pagination.constant';
import { BaseModule } from '../../../../shared/modules/base.module';
import { PaginationModule } from '../../../../shared/modules/pagination.module';
import { ExportService } from '../../../../shared/services/export.service';
import { MODULE } from '../../../../shared/constants/module.constant';
import { ServiceService } from '../service.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-service-list',
  imports: [BaseModule, PaginationModule],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.scss',
})
export class ServiceListComponent
  extends PaginationHandler<IPaginationFilterBase>
  implements OnInit, OnDestroy
{
  servicesList$: Observable<IServiceList>;
  private readonly _destroy$ = new Subject<void>();

  readonly labels = {
    headers: {
      name: 'Name',
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
      delete: 'Delete',
    },
    new: 'New',
    generate: 'Generate',
  };

  constructor(
    private readonly _formBuilder: FormBuilder,
    readonly _apiService: ApiBaseService<IPaginationFilterBase, IServiceList>,
    private readonly _exportService: ExportService,
    private readonly _serviceService: ServiceService
  ) {
    super(_apiService);
  }

  ngOnInit(): void {
    this.servicesList$ = this._apiService.filterParams$.pipe(
      takeUntil(this._destroy$),
      switchMap((params) => {
        if (params.isRefresh) {
          this.resetForm();
          params.isRefresh = false;
        }

        this.paginationFilter = params as IPaginationFilterBase;

        return this._apiService.get(
          this.paginationFilter,
          `${API_URL.fileMaintenance.service}`
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
        return of({ data: null, ...DEFAULT_PAGINATION } as IServiceList);
      })
    );

    this.resetForm();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.resetFilter();
  }

  serviceFormGroup: FormGroup;

  resetForm() {
    this.serviceFormGroup = this._formBuilder.group({
      searchValue: new FormControl(),
    });
  }

  generate(){
    this._serviceService.generate()
    .pipe(take(1))
    .subscribe((response: any)=>{
      const result = response.data;
      this._exportService.exportToPdf(result, 'services.pdf', MODULE.service);
    });
  }
}