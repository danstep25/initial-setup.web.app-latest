import { Routes } from '@angular/router';
import { LoginComponent } from './modules/authentication/login/login.component';
import { UserComponent } from './modules/Admin/user/user.component';
import { UserFormComponent } from './modules/Admin/user/user-form/user-form.component';
import { UserGroupComponent } from './modules/Admin/user-group/user-group.component';
import { UserGroupFormComponent } from './modules/Admin/user-group/user-group-form/user-group-form.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { BusinessFilesComponent } from './modules/business-files/business-files.component';
import { SupplierComponent } from './modules/file-maintenance/supplier/supplier.component';
import { SupplierFormComponent } from './modules/file-maintenance/supplier/supplier-form/supplier-form.component';
import { IngredientsComponent } from './modules/file-maintenance/ingredients/ingredients.component';
import { IngridientFormComponent } from './modules/file-maintenance/ingredients/ingridient-form/ingridient-form.component';
import { UnitOfMeasurementComponent } from './modules/file-maintenance/unit-of-measurement/unit-of-measurement.component';
import { UnitOfMeasurementFormComponent } from './modules/file-maintenance/unit-of-measurement/unit-of-measurement-form/unit-of-measurement-form.component';
import { CategoryComponent } from './modules/file-maintenance/category/category.component';
import { CategoryFormComponent } from './modules/file-maintenance/category/category-form/category-form.component';
import { DishesComponent } from './modules/file-maintenance/dishes/dishes.component';
import { DishesFormComponent } from './modules/file-maintenance/dishes/dishes-form/dishes-form.component';
import { FoodPackageComponent } from './modules/file-maintenance/food-package/food-package.component';
import { FoodPackageFormComponent } from './modules/file-maintenance/food-package/food-package-form/food-package-form.component';
import { EventComponent } from './modules/file-maintenance/event/event.component';
import { EventFormComponent } from './modules/file-maintenance/event/event-form/event-form.component';
import { ServiceComponent } from './modules/file-maintenance/service/service.component';
import { ServiceFormComponent } from './modules/file-maintenance/service/service-form/service-form.component';
import { ReservationComponent } from './modules/reservation/reservation.component';
import { ReservationListComponent } from './modules/reservation/reservation-list/reservation-list.component';
import { ReservationFormComponent } from './modules/reservation/reservation-form/reservation-form.component';
import { ReservationListCalendarComponent } from './modules/reservation/reservation-list-calendar/reservation-list-calendar.component';
import { ReservationCalendarComponent } from './modules/reservation/reservation-calendar/reservation-calendar.component';
import { VenueComponent } from './modules/file-maintenance/venue/venue.component';
import { VenueFormComponent } from './modules/file-maintenance/venue/venue-form/venue-form.component';
import { TransactionListComponent } from './modules/transaction/transaction-list/transaction-list.component';
import { TransactionComponent } from './modules/transaction/transaction.component';
import { AuthorizeGuard } from './modules/authentication/authorize.guard';
import { AuditComponent } from './modules/audit/audit.component';
import { ReportsComponent } from './modules/reports/reports.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // ✅ Default route
  { path: 'login', component: LoginComponent },

  { path: 'dashboard', canActivate: [AuthorizeGuard], component: DashboardComponent },

  {
    path: 'file-maintenance',
    children: [
      {
        path: 'suppliers',
        canActivate: [AuthorizeGuard],
        children: [
          {
            path: '',
            component: SupplierComponent,
          },
          {
            path: 'new',
            component: SupplierFormComponent,
          },
          {
            path: ':id/edit',
            component: SupplierFormComponent,
          },
        ],
      },

      {
        path: 'ingredients',
        children: [
          {
            path: '',
            component: IngredientsComponent,
          },

          {
            path: 'new',
            component: IngridientFormComponent,
          },
          {
            path: ':id/edit',
            component: IngridientFormComponent,
          },
        ],
      },

      {
        path: 'unit-of-measurements',
        children: [
          {
            path: '',
            component: UnitOfMeasurementComponent,
          },

          {
            path: 'new',
            component: UnitOfMeasurementFormComponent,
          },
          {
            path: ':id/edit',
            component: UnitOfMeasurementFormComponent,
          },
        ],
      },

      {
        path: 'categories',
        children: [
          {
            path: '',
            component: CategoryComponent,
          },
          {
            path: 'new',
            component: CategoryFormComponent,
          },
          {
            path: ':id/edit',
            component: CategoryFormComponent,
          },
        ],
      },

      {
        path: 'dishes',
        children: [
          {
            path: '',
            component: DishesComponent,
          },
          {
            path: 'new',
            component: DishesFormComponent,
          },
          {
            path: ':id/edit',
            component: DishesFormComponent,
          },
        ],
      },

      {
        path: 'food-packages',
        children: [
          {
            path: '',
            component: FoodPackageComponent,
          },
          {
            path: 'new',
            component: FoodPackageFormComponent,
          },
          {
            path: ':id/edit',
            component: FoodPackageFormComponent,
          },
        ],
      },

      {
        path: 'events',
        children: [
          {
            path: '',
            component: EventComponent,
          },
          {
            path: 'new',
            component: EventFormComponent,
          },
          {
            path: ':id/edit',
            component: EventFormComponent,
          },
        ],
      },

      {
        path: 'services',
        children: [
          {
            path: '',
            component: ServiceComponent,
          },
          {
            path: 'new',
            component: ServiceFormComponent,
          },
          {
            path: ':id/edit',
            component: ServiceFormComponent,
          },
        ],
      },

      {
        path: 'venues',
        children: [
          {
            path: '',
            component: VenueComponent,
          },
          {
            path: 'new',
            component: VenueFormComponent,
          },
          {
            path: ':id/edit',
            component: VenueFormComponent,
          },
        ],
      },
    ],
  },

  {
    path: 'admin',
    children: [
      {
        path: 'users',
        children: [
          {
            path: '',
            component: UserComponent,
          },
          {
            path: 'new',
            component: UserFormComponent,
          },
          {
            path: ':id/edit',
            component: UserFormComponent,
          },
        ],
      },

      {
        path: 'user-groups',
        children: [
          {
            path: '',
            component: UserGroupComponent,
          },
          {
            path: 'new',
            component: UserGroupFormComponent,
          },
          {
            path: ':id/edit',
            component: UserGroupFormComponent,
          },
        ],
      },
    ],
  },

  {
    path: 'business-files',
    children: [
      {
        path: '',
        component: BusinessFilesComponent,
      },
    ],
  },

  {
    path: 'reservation',
    children: [
      {
        path: '',
        component: ReservationComponent,
      },
      {
        path: 'new',
        component: ReservationFormComponent,
      },
      {
        path: ':id/edit',
        component: ReservationFormComponent,
      },

      {
        path: 'calendar',
        component: ReservationCalendarComponent,
      },
    ],
  },

  {
    path: 'transaction',
    children: [
      {
        path: '',
        component: TransactionComponent,
      },
      {
        path: 'new',
        component: ReservationFormComponent,
      },
    ],
  },

  {
    path: 'audit',
    children: [
      {
        path: '',
        component: AuditComponent,
      },
    ],
  },
  {
    path: 'report',
    children: [
      {
        path: '',
        component: ReportsComponent,
      },
    ],
  },
];
