import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAuditForm } from '../models/audit/audit.model';
import { API_URL } from '../constants/api.url.constant';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor(private readonly _httpClient: HttpClient){}

  log(request: IAuditForm){
    this._httpClient
      .post(`${API_URL.audit.createAudit}`, { request: request })
      .subscribe();
  }

  generate(){
    return this._httpClient.get(`${API_URL.audit.generate}`);
  }
}
