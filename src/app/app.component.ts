import { Component, ViewChild, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { ToastComponentComponent } from './shared/component/toast-component/toast.component';
import { NavHeaderComponent } from './shared/component/nav-header/nav-header.component';
import { BaseModule } from './shared/modules/base.module';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { SideNavBarComponent } from './shared/component/side-nav-bar/side-nav-bar.component';
import { SideNavBarService } from './shared/component/side-nav-bar/side-nav-bar.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BehaviorSubject, EMPTY, Observable, of, switchMap } from 'rxjs';
import { AuthServiceService } from './shared/services/auth-service.service';
import { ROUTES } from './shared/constants/module.routes.constant';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BaseModule,
    RouterOutlet,
    ReactiveFormsModule,
    ToastComponentComponent,
    NavHeaderComponent,
    SideNavBarComponent,
    MatSidenavModule,
    MatToolbarModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Caterlink.App';

  isLoggedIn$ = new Observable<boolean>();

  constructor(
    private readonly _authService: AuthServiceService,
    private readonly router: Router
  ) {
    
  }

  ngOnInit(): void {
    this._authService.isLoggedIn();

    this.isLoggedIn$ = this._authService.isLoggedIn$.pipe(
      switchMap((isloggedIn) => {
        if (isloggedIn) return of(isloggedIn);

        this.router.navigateByUrl(ROUTES.login);
        return of(isloggedIn);
      })
    );
  }
}
