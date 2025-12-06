import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseModule } from '../../../../shared/modules/base.module';
import { PaginationModule } from '../../../../shared/modules/pagination.module';
import { PaginationHandler } from '../../../../shared/handler/pagination.handler';
import { IPaginationFilterBase } from '../../../../shared/models/required/pagination.model';
import { catchError, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { IVenueList } from '../../../../shared/models/file-maintenance/venue.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiBaseService } from '../../../../shared/services/api-base.service';
import { API_URL } from '../../../../shared/constants/api.url.constant';
import { DEFAULT_PAGINATION } from '../../../../shared/constants/pagination.constant';
import { ExportService } from '../../../../shared/services/export.service';
import { MODULE } from '../../../../shared/constants/module.constant';
import { VenueService } from '../venue.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-venue-list',
  imports: [BaseModule, PaginationModule],
  templateUrl: './venue-list.component.html',
  styleUrl: './venue-list.component.scss',
})
export class VenueListComponent
  extends PaginationHandler<IPaginationFilterBase>
  implements OnInit, OnDestroy
{
  venueList$: Observable<IVenueList>;
  private readonly _destroy$ = new Subject<void>();

  readonly labels = {
    headers: {
      name: 'Name',
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
    readonly _apiService: ApiBaseService<IPaginationFilterBase, IVenueList>,
    private readonly _exportService: ExportService,
    private readonly _venueService: VenueService
  ) {
    super(_apiService);
  }

  ngOnInit(): void {
    this.venueList$ = this._apiService.filterParams$.pipe(
      takeUntil(this._destroy$),
      switchMap((params) => {
        if (params.isRefresh) {
          this.resetForm();
          params.isRefresh = false;
        }

        this.paginationFilter = params as IPaginationFilterBase;

        return this._apiService.get(
          this.paginationFilter,
          `${API_URL.fileMaintenance.venue}`
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
        return of({ data: null, ...DEFAULT_PAGINATION } as IVenueList);
      })
    );

    this.resetForm();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.resetFilter();
  }

  venueFormGroup: FormGroup;

  resetForm() {
    this.venueFormGroup = this._formBuilder.group({
      searchValue: new FormControl(),
    });
  }

  generate(){
    this._venueService.generate()
    .pipe(take(1))
    .subscribe((response: any)=>{
      const result = response.data;
      this._exportService.exportToPdf(result, 'venues.pdf', MODULE.venue);
    });
  }
}