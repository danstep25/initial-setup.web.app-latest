import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseModule } from '../../shared/modules/base.module';
import { ApiBaseService } from '../../shared/services/api-base.service';
import { API_URL } from '../../shared/constants/api.url.constant';
import { IPaginationFilterBase } from '../../shared/models/required/pagination.model';
import { ITransactionList } from '../../shared/models/transaction/transaction.model';
import { IReservationList } from '../../shared/models/reservation/reservation.model';
import { IDashboardStats } from '../../shared/models/dashboard/dashboard.model';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { DEFAULT_PAGINATION } from '../../shared/constants/pagination.constant';

@Component({
  selector: 'app-dashboard',
  imports: [BaseModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  
  dashboardStats$: Observable<IDashboardStats>;
  recentTransactions$: Observable<any[]>;
  recentReservations$: Observable<any[]>;
  
  readonly labels = {
    title: 'Dashboard',
    stats: {
      totalReservations: 'Total Reservations',
      totalTransactions: 'Total Transactions',
      totalRevenue: 'Total Revenue',
      pendingPayments: 'Pending Payments',
      upcomingReservations: 'Upcoming Reservations',
      completedReservations: 'Completed Reservations',
    },
    recent: {
      transactions: 'Recent Transactions',
      reservations: 'Recent Reservations',
    }
  };

  constructor(
    private readonly _transactionApiService: ApiBaseService<IPaginationFilterBase, ITransactionList>,
    private readonly _reservationApiService: ApiBaseService<IPaginationFilterBase, IReservationList>
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private loadDashboardData(): void {
    const transactionParams: IPaginationFilterBase = {
      pageIndex: 1,
      pageSize: 100,
      sortKey: null,
      sortDirection: '',
      isRefresh: false,
    };

    const reservationParams: IPaginationFilterBase = {
      pageIndex: 1,
      pageSize: 100,
      sortKey: null,
      sortDirection: '',
      isRefresh: false,
    };

    // Fetch transactions and reservations in parallel
    const transactions$ = this._transactionApiService.get(
      transactionParams,
      `${API_URL.transaction.transaction}`
    ).pipe(
      catchError(() => of({ 
        data: [], 
        ...DEFAULT_PAGINATION,
        status: 'error',
        message: '',
        code: 0
      } as unknown as ITransactionList))
    );

    const reservations$ = this._reservationApiService.get(
      reservationParams,
      `${API_URL.reservation.reservation}`
    ).pipe(
      catchError(() => of({ 
        data: [], 
        ...DEFAULT_PAGINATION,
        status: 'error',
        message: '',
        code: 0
      } as unknown as IReservationList))
    );

    // Calculate statistics
    this.dashboardStats$ = forkJoin([transactions$, reservations$]).pipe(
      map(([transactions, reservations]) => {
        const transactionData = Array.isArray(transactions.data) ? transactions.data : [];
        const reservationData = Array.isArray(reservations.data) ? reservations.data : [];
        
        const totalRevenue = transactionData.reduce((sum: number, t: any) => {
          const paid = (t.totalPrice || 0) - (t.balance || 0);
          return sum + paid;
        }, 0);

        const pendingPayments = transactionData.reduce((sum: number, t: any) => {
          return sum + (t.balance || 0);
        }, 0);

        const now = new Date();
        const upcomingReservations = reservationData.filter((r: any) => {
          const dateFrom = new Date(r.dateFrom);
          return dateFrom >= now;
        }).length;

        const completedReservations = reservationData.filter((r: any) => {
          const dateTo = new Date(r.dateTo);
          return dateTo < now;
        }).length;

        return {
          totalReservations: reservationData.length,
          totalTransactions: transactionData.length,
          totalRevenue: totalRevenue,
          pendingPayments: pendingPayments,
          upcomingReservations: upcomingReservations,
          completedReservations: completedReservations,
        } as IDashboardStats;
      }),
      takeUntil(this._destroy$)
    );

    // Get recent transactions (last 5)
    this.recentTransactions$ = transactions$.pipe(
      map(transactions => {
        const data = Array.isArray(transactions.data) ? transactions.data : [];
        return data
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
      }),
      takeUntil(this._destroy$)
    );

    // Get recent reservations (last 5)
    this.recentReservations$ = reservations$.pipe(
      map(reservations => {
        const data = Array.isArray(reservations.data) ? reservations.data : [];
        return data
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
      }),
      takeUntil(this._destroy$)
    );
  }
}
