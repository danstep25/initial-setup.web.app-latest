import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../../shared/constants/api.url.constant';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(private readonly _httpClient: HttpClient){}

  updateTransaction(request){
    return this._httpClient.post(`${API_URL.transaction.updateTransaction}`, { request: request })
  }
}
