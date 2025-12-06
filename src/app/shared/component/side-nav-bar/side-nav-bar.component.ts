import { Component, OnInit } from '@angular/core';
import { SideNavBarService } from './side-nav-bar.service';
import { Observable, of } from 'rxjs';
import { BaseModule } from '../../modules/base.module';
import { Router } from '@angular/router';
import { ROUTES } from '../../constants/module.routes.constant';
import { MODULE } from '../../constants/module.constant';
import { NavigationList } from '../../constants/navigation.module.constant';
import { AuthServiceService } from '../../services/auth-service.service';
import { INavigation } from '../../models/navigation';
import { PermissionService } from '../../services/permission.service';
@Component({
  selector: 'app-side-nav-bar',
  standalone: true,
  imports: [BaseModule],
  templateUrl: './side-nav-bar.component.html',
  styleUrl: './side-nav-bar.component.scss',
})
export class SideNavBarComponent implements OnInit {
  constructor(
    private readonly _sideNavService: SideNavBarService,
    private readonly _autService: AuthServiceService,
    private readonly router: Router,
    private readonly _permissionService: PermissionService
  ) {}

  activeModule: Observable<string>;
  activeSubModule: Observable<string>;
  readonly NavigationList = NavigationList;
  readonly labels = {
    logout: 'Logout',
  };

  ngOnInit(): void {
    this.activeModule = this._sideNavService._activeModule$;
    this.activeSubModule = this._sideNavService._activeSubModule$;
  }

  navigate(navigation: INavigation, parentModule?: string) {
    var route = '';
    var module = navigation.module;

    if (navigation?.subModules === undefined) {
      switch (module.replace(/\s/g, '')) {
        case MODULE.dashboard:
          route = ROUTES.dashboard;

          break;

        case MODULE.user:
          route = ROUTES.admin.user;
          break;

        case MODULE.userGroup:
          route = ROUTES.admin.userGroup;
          break;

        case MODULE.businessFile:
          route = ROUTES.businessFiles;
          break;

        case MODULE.supplier:
          route = ROUTES.fileMaintenance.supplier;
          break;

        case MODULE.ingredients:
          route = ROUTES.fileMaintenance.ingredients;
          break;

        case MODULE.unitOfMeasurement:
          route = ROUTES.fileMaintenance.unitOfMeasurement;
          break;

        case MODULE.category:
          route = ROUTES.fileMaintenance.category;
          break;

        case MODULE.dish:
          route = ROUTES.fileMaintenance.dish;
          break;

        case MODULE.foodPackage:
          route = ROUTES.fileMaintenance.foodPackage;
          break;

        case MODULE.event:
          route = ROUTES.fileMaintenance.event;
          break;

        case MODULE.service:
          route = ROUTES.fileMaintenance.service;
          break;

        case MODULE.venue:
          route = ROUTES.fileMaintenance.venue;
          break;

        case MODULE.reservation:
          route = ROUTES.reservation;
          break;

        case MODULE.transaction:
          route = ROUTES.transaction;
          break;

        case MODULE.audit:
          route = ROUTES.audit;
          break;

        case MODULE.reports:
          route = ROUTES.report;
          break;
      }

      this.router.navigateByUrl(route);
    }

    if (parentModule)
      return this._sideNavService.isActiveSubModule(module);

    this._sideNavService.isActiveModule(module);
    this._sideNavService.isActiveSubModule(null);
  }

  logout() {
    this._autService.logout();
  }

  hasPermission(){
    return this._permissionService.hasPermission();
  }

  getUsername(){
    return JSON.parse( sessionStorage.getItem('userInfo'))?.username
  }
}
