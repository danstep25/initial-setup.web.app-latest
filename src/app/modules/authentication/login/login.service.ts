import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../../shared/constants/api.url.constant';
import { IUserAuthenticationRequest } from '../../../shared/models/admin/user.model';
import { catchError } from 'rxjs';
import { ApiBase } from '../../../shared/services/apiBase';

@Injectable({
  providedIn: 'root',
})
export class LoginService extends ApiBase {
  constructor(private readonly _httpClient: HttpClient) {
    super();
  }

  login(authentication: IUserAuthenticationRequest) {
    return this._httpClient.post(`${API_URL.security.authentication}`, {
      username: authentication.username,
      password: authentication.password,
    }).pipe(catchError((error) => this.handleError(error)));
  }
}
