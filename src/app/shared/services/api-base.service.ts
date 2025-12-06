import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiBase } from './apiBase';
import { IPagination, IResponse } from '../models/required/pagination.model';
import { DEFAULT_PAGINATION } from '../constants/pagination.constant';

@Injectable({
  providedIn: 'root',
})
export class ApiBaseService<TRequest = any, TResponse = any> extends ApiBase {
  readonly defaultParams = {
    pageIndex: DEFAULT_PAGINATION.pageIndex,
    pageSize: DEFAULT_PAGINATION.pageSize,
    sortKey: null,
    sortDirection: '',
    isRefresh: false,
  } as TRequest;

  private readonly _filterParams$ = new BehaviorSubject<TRequest>(
    this.defaultParams
  );

  filterParams$ = this._filterParams$.asObservable();

  constructor(private readonly _httpClient: HttpClient) {
    super();
  }

  get(request: TRequest, endpoint: string): Observable<TResponse> {
    const params = this.buildHttpParams(request);
    return this._httpClient
      .get<TResponse>(`${endpoint}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }
  
  set(request: TRequest, endpoint: string) {
    return this._httpClient
      .post(`${endpoint}`, { request: request })
      .pipe(catchError(this.handleError));
  }

  paginationFilter(request: TRequest): void{
    this._filterParams$.next(request);
  }
}
