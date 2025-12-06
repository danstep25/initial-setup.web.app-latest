import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../shared/constants/api.url.constant';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private readonly _httpClient: HttpClient){}
  generate(){
    return this._httpClient
          .get(`${API_URL.transaction.generate}`);
  }
}
