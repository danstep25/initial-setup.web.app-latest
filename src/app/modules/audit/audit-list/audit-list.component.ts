import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseModule } from '../../../shared/modules/base.module';
import { PaginationModule } from '../../../shared/modules/pagination.module';
import { PaginationHandler } from '../../../shared/handler/pagination.handler';
import { IPaginationFilterBase } from '../../../shared/models/required/pagination.model';
import { catchError, Observable, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { IAuditList } from '../../../shared/models/audit/audit.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiBaseService } from '../../../shared/services/api-base.service';
import { API_URL } from '../../../shared/constants/api.url.constant';
import { DEFAULT_PAGINATION } from '../../../shared/constants/pagination.constant';
import { ExportService } from '../../../shared/services/export.service';
import { MODULE } from '../../../shared/constants/module.constant';
import { AuditService } from '../../../shared/services/audit.service';

@Component({
  selector: 'app-audit-list',
  imports: [BaseModule, PaginationModule],
  templateUrl: './audit-list.component.html',
  styleUrl: './audit-list.component.scss'
})
export class AuditListComponent extends PaginationHandler<IPaginationFilterBase>
  implements OnInit, OnDestroy
{
  auditList$: Observable<IAuditList>;
  private readonly _destroy$ = new Subject<void>();

  readonly labels = {
    headers: {
      username: 'Username',
      action: 'Action',
      module: 'Module',
      description: 'Description',
      createdAt: 'Created At',
    },
    placeholder: {
      search: 'Search',
      reset: 'Reset',
    },
    actions: {
      edit: 'Edit',
      delete: 'Delete',
      pay: 'Pay',
    },
    new: 'New',
    viewCalendar: 'View Calendar',
    generate: 'Generate',
  };

  constructor(
    private readonly _formBuilder: FormBuilder,
    readonly _apiService: ApiBaseService<
      IPaginationFilterBase,
      IAuditList
    >,
    private readonly _exportService: ExportService,
    private readonly _auditReportService: AuditService
  ) {
    super(_apiService);
  }

  ngOnInit(): void {
    this.auditList$ = this._apiService.filterParams$.pipe(
      takeUntil(this._destroy$),
      switchMap((params) => {
        if (params.isRefresh) {
          this.resetForm();
          params.isRefresh = false;
        }

        this.paginationFilter = params as IPaginationFilterBase;

        return this._apiService.get(
          this.paginationFilter,
          `${API_URL.audit.audit}`
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
        return of({ data: null, ...DEFAULT_PAGINATION } as IAuditList);
      })
    );

    this.resetForm();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.resetFilter();
  }

  auditFormGroup: FormGroup;

  resetForm() {
    this.auditFormGroup = this._formBuilder.group({
      searchValue: new FormControl(),
    });
  }

  generate(){
    this._auditReportService.generate()
    .pipe(take(1))
    .subscribe((response: any)=>{
      const result = response.data;
      this._exportService.exportToPdf(result, 'audits.pdf', MODULE.audit);
    });
  }
}
