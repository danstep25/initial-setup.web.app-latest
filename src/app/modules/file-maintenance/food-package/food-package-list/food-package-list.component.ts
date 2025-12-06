import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginationHandler } from '../../../../shared/handler/pagination.handler';
import { IPaginationFilterBase } from '../../../../shared/models/required/pagination.model';
import { catchError, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { BaseModule } from '../../../../shared/modules/base.module';
import { PaginationModule } from '../../../../shared/modules/pagination.module';
import { IFoodPackageList } from '../../../../shared/models/file-maintenance/food-package.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiBaseService } from '../../../../shared/services/api-base.service';
import { API_URL } from '../../../../shared/constants/api.url.constant';
import { DEFAULT_PAGINATION } from '../../../../shared/constants/pagination.constant';
import { ExportService } from '../../../../shared/services/export.service';
import { MODULE } from '../../../../shared/constants/module.constant';
import { FoodPackageService } from '../food-package.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-food-package-list',
  imports: [BaseModule, PaginationModule],
  templateUrl: './food-package-list.component.html',
  styleUrl: './food-package-list.component.scss',
})
export class FoodPackageListComponent
  extends PaginationHandler<IPaginationFilterBase>
  implements OnInit, OnDestroy
{
  foodPackageList$: Observable<IFoodPackageList>;
  private readonly _destroy$ = new Subject<void>();

  readonly labels = {
    headers: {
      name: 'Name',
      description: 'Description',
      pax: 'pax',
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
    readonly _apiService: ApiBaseService<IPaginationFilterBase, IFoodPackageList>,
    private readonly _exportService: ExportService,
    private readonly _foodPackageService: FoodPackageService
  ) {
    super(_apiService);
  }

  ngOnInit(): void {
    this.foodPackageList$ = this._apiService.filterParams$.pipe(
      takeUntil(this._destroy$),
      switchMap((params) => {
        if (params.isRefresh) {
          this.resetForm();
          params.isRefresh = false;
        }

        this.paginationFilter = params as IPaginationFilterBase;

        return this._apiService.get(
          this.paginationFilter,
          `${API_URL.fileMaintenance.foodPackage}`
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
        return of({ data: null, ...DEFAULT_PAGINATION } as IFoodPackageList);
      })
    );

    this.resetForm();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.resetFilter();
  }

  foodPackageFormGroup: FormGroup;

  resetForm() {
    this.foodPackageFormGroup = this._formBuilder.group({
      searchValue: new FormControl(),
    });
  }

  generate(){
    this._foodPackageService.generate()
    .pipe(take(1))
    .subscribe((response: any)=>{
      const result = response.data;
      this._exportService.exportToPdf(result, 'food-packages.pdf', MODULE.foodPackage);
    });
  }
}
