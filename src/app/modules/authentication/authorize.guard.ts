import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthServiceService } from '../../shared/services/auth-service.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AuthorizeGuard implements CanActivate {

  constructor(private _authService: AuthServiceService, private readonly _router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {

    if (this._authService.isLoggedIn()) {
      return true; // ✅ Allow access
    }
    console.warn('shnure', this._authService.isLoggedIn());
    return this._router.createUrlTree(['/login']);
  }
}