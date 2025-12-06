import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUserInfo } from '../models/admin/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private readonly _isLoggedIn$ = new BehaviorSubject<boolean>(false);
  readonly isLoggedIn$ = this._isLoggedIn$.asObservable();

  login(userInfo: IUserInfo): void {
    this.setUserInformation(userInfo);
    this._isLoggedIn$.next(true);
  }

  logout() {
    localStorage.setItem('isLoggedIn', 'false');
    this.removeUserInformation();
    this._isLoggedIn$.next(false);
  }

  private setUserInformation(userInfo: IUserInfo) {
    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
  }

  private removeUserInformation() {
    sessionStorage.removeItem('userInfo');
  }

  isLoggedIn() {
    const userInfo = JSON.parse(
      sessionStorage.getItem('userInfo') || null
    ) as IUserInfo;

    if (!userInfo){
      this._isLoggedIn$.next(false);
      return false;
    }
    
      this._isLoggedIn$.next(true);
      return true;
  }
}
