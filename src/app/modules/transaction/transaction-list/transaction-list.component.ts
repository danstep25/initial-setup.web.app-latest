import { Component, OnDestroy, OnInit } from '@angular/core';
import { PaginationHandler } from '../../../shared/handler/pagination.handler';
import { IPaginationFilterBase } from '../../../shared/models/required/pagination.model';
import { BaseModule } from '../../../shared/modules/base.module';
import { PaginationModule } from '../../../shared/modules/pagination.module';
import {
  catchError,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { IReservationList } from '../../../shared/models/reservation/reservation.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ApiBaseService } from '../../../shared/services/api-base.service';
import { API_URL } from '../../../shared/constants/api.url.constant';
import { DEFAULT_PAGINATION } from '../../../shared/constants/pagination.constant';
import { ITransactionList } from '../../../shared/models/transaction/transaction.model';
import { MatDialog } from '@angular/material/dialog';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { ExportService } from '../../../shared/services/export.service';
import { TransactionService } from '../transaction.service';
import { MODULE } from '../../../shared/constants/module.constant';

@Component({
  selector: 'app-transaction-list',
  imports: [BaseModule, PaginationModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
})
export class TransactionListComponent
  extends PaginationHandler<IPaginationFilterBase>
  implements OnInit, OnDestroy
{
  transactionList$: Observable<ITransactionList>;
  private readonly _destroy$ = new Subject<void>();

  readonly labels = {
    headers: {
      fullName: 'Full Name',
      address: 'Address',
      contactNo: 'Contact No.',
      scheduledDate: 'Scheduled Date',
      balance: 'Balance',
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
      pay: 'Pay',
    },
    new: 'New',
    generate: 'Generate',
    viewCalendar: 'View Calendar',
  };

  constructor(
    private readonly _formBuilder: FormBuilder,
    readonly _apiService: ApiBaseService<
      IPaginationFilterBase,
      ITransactionList
    >,
    private readonly _exportService: ExportService,
    private readonly _transactionService: TransactionService
  ) {
    super(_apiService);
  }

  ngOnInit(): void {
    this.transactionList$ = this._apiService.filterParams$.pipe(
      takeUntil(this._destroy$),
      switchMap((params) => {
        if (params.isRefresh) {
          this.resetForm();
          params.isRefresh = false;
        }

        this.paginationFilter = params as IPaginationFilterBase;

        return this._apiService.get(
          this.paginationFilter,
          `${API_URL.transaction.transaction}`
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
        return of({ data: null, ...DEFAULT_PAGINATION } as ITransactionList);
      })
    );

    this.resetForm();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.resetFilter();
  }

  transactionFormGroup: FormGroup;

  resetForm() {
    this.transactionFormGroup = this._formBuilder.group({
      searchValue: new FormControl(),
    });
  }

  openDialog(data): void {
    const dialogRef = this._dialog.open(TransactionFormComponent, {
      data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.resetFilter();
    });
  }
  
  generate(){
    this._transactionService.generate()
    .pipe(take(1))
    .subscribe((response: any)=>{
      const result = response.data;
      this._exportService.exportToPdf(result, 'transaction.pdf', MODULE.transaction);
    });
  }
}
