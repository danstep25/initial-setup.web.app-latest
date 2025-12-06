import { Injectable } from '@angular/core';
import { ApiBase } from './apiBase';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants/api.url.constant';
import { map, of, take, Observable } from 'rxjs';

interface LookupOptions {
  id: number;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class LookupService extends ApiBase {
  constructor(private readonly _httpClient: HttpClient) {
    super();
  }

  getSupplierList(): Observable<LookupOptions[]> {
    return this._httpClient
      .get<LookupOptions[]>(API_URL.fileMaintenance.supplierOptions)
      .pipe(take(1));
  }

  getUnitOfMeasurementList(): Observable<LookupOptions[]> {
    return this._httpClient
      .get<LookupOptions[]>(API_URL.fileMaintenance.unitOfMeasurementOptions)
      .pipe(take(1));
  }

  getCategoryList(): Observable<LookupOptions[]> {
    return this._httpClient
      .get<LookupOptions[]>(API_URL.fileMaintenance.categoryOptions)
      .pipe(take(1));
  }

  getIngredientList(): Observable<LookupOptions[]> {
    return this._httpClient
      .get<LookupOptions[]>(API_URL.fileMaintenance.ingredientOptions)
      .pipe(take(1));
  }

  getDishList(): Observable<LookupOptions[]> {
    return this._httpClient
      .get<LookupOptions[]>(API_URL.fileMaintenance.DishOptions)
      .pipe(take(1));
  }

  getEventList(): Observable<LookupOptions[]> {
    return this._httpClient
      .get<LookupOptions[]>(API_URL.fileMaintenance.EventOptions)
      .pipe(take(1));
  }

  getFoodPackageList(): Observable<LookupOptions[]> {
    return this._httpClient
      .get<LookupOptions[]>(API_URL.fileMaintenance.foodPackageOptions)
      .pipe(take(1));
  }

  getVenueList(): Observable<LookupOptions[]> {
    return this._httpClient
      .get<LookupOptions[]>(API_URL.fileMaintenance.VenueOptions)
      .pipe(take(1));
  }

  getServiceList(): Observable<LookupOptions[]> {
    return this._httpClient
      .get<LookupOptions[]>(API_URL.fileMaintenance.ServiceOptions)
      .pipe(take(1));
  }
}
