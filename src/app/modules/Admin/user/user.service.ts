import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { API_URL } from '../../../shared/constants/api.url.constant';
import { IUserList } from '../../../shared/models/admin/user.model';
import { ApiBase } from '../../../shared/services/apiBase';
import { IPaginationFilterBase } from '../../../shared/models/required/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiBase {
  constructor(private readonly _httpClient: HttpClient) {
    super();
  }

  getAllUsers(filter: IPaginationFilterBase): Observable<IUserList> {
    const params = this.buildHttpParams(filter);
    return this._httpClient.post<IUserList>(`${API_URL.admin.user}`, filter);
  }

  deactiavateUser(request){
    return this._httpClient
          .post(`${API_URL.admin.deactivateUser}`, { request: request })
          .pipe(catchError(this.handleError));
  }

  generate(){
    return this._httpClient
          .get(`${API_URL.admin.generate}`);
  }
}
