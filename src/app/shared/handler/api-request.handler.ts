import { Router } from "@angular/router";
import { API_URL } from "../constants/api.url.constant";
import { METHOD, MODULE } from "../constants/module.constant";


export class RequestHandler {
  constructor(private readonly _router: Router) {}

  public static getAPI(module: MODULE, method?: METHOD): string {
    switch (module) {
      case MODULE.user:
        return this.getUserAPI(method);

      case MODULE.userGroup:
        return this.getUserGroupAPI(method);

      case MODULE.supplier:
        return this.getSupplierAPI(method);

      case MODULE.ingredients:
        return this.getIngredientAPI(method);

      case MODULE.unitOfMeasurement:
        return this.getUnitOfMeasurementAPI(method);

      case MODULE.category:
        return this.getCategoryAPI(method);

      case MODULE.dish:
        return this.getDishAPI(method);

      case MODULE.foodPackage:
        return this.getFoodPackageAPI(method);

      case MODULE.event:
        return this.getEventAPI(method);

      case MODULE.service:
        return this.getServiceAPI(method);

      case MODULE.reservation:
        return this.getReservationAPI(method);

      case MODULE.venue:
        return this.getVenueAPI(method);
    }
  }

  public returnMainModule(module: MODULE): Promise<boolean> {
    switch (module) {
      case MODULE.user:
        return this._router.navigateByUrl(`admin/users`);

      case MODULE.userGroup:
        return this._router.navigateByUrl(`admin/user-groups`);

      case MODULE.supplier:
        return this._router.navigateByUrl(`file-maintenance/suppliers`);

      case MODULE.ingredients:
        return this._router.navigateByUrl(`file-maintenance/ingredients`);

      case MODULE.unitOfMeasurement:
        return this._router.navigateByUrl(
          `file-maintenance/unit-of-measurements`
        );

      case MODULE.category:
        return this._router.navigateByUrl(`file-maintenance/categories`);

      case MODULE.dish:
        return this._router.navigateByUrl(`file-maintenance/dishes`);

      case MODULE.foodPackage:
        return this._router.navigateByUrl(`file-maintenance/food-packages`);

      case MODULE.event:
        return this._router.navigateByUrl(`file-maintenance/events`);

      case MODULE.service:
        return this._router.navigateByUrl(`file-maintenance/services`);

      case MODULE.venue:
        return this._router.navigateByUrl(`file-maintenance/venues`);

      case MODULE.reservation:
        return this._router.navigateByUrl(`reservation`);
    }
  }

  private static getUserAPI(method?: METHOD): string {
    if (method === METHOD.post) return API_URL.admin.createUser;
    else if (method === METHOD.get) return API_URL.admin.viewUser;
    else if (method === METHOD.put) return API_URL.admin.updateUser;

    return API_URL.admin.deleteUser;
  }

  private static getUserGroupAPI(method?: METHOD): string {
    if (method === METHOD.post) return API_URL.admin.createUserGroup;
    else if (method === METHOD.get) return API_URL.admin.viewUserGroup;
    else if (method === METHOD.put) return API_URL.admin.updateUserGroup;

    return API_URL.admin.deleteUserGroup;
  }

  private static getSupplierAPI(method?: METHOD): string {
    if (method === METHOD.post) return API_URL.fileMaintenance.createSupplier;
    else if (method === METHOD.get) return API_URL.fileMaintenance.viewSupplier;
    else if (method === METHOD.put)
      return API_URL.fileMaintenance.updateSupplier;

    return API_URL.fileMaintenance.deleteSupplier;
  }

  private static getIngredientAPI(method?: METHOD): string {
    if (method === METHOD.post) return API_URL.fileMaintenance.createIngredient;
    else if (method === METHOD.get)
      return API_URL.fileMaintenance.viewIngredient;
    else if (method === METHOD.put)
      return API_URL.fileMaintenance.updateIngredient;

    return API_URL.fileMaintenance.deleteIngredient;
  }

  private static getUnitOfMeasurementAPI(method?: METHOD): string {
    if (method === METHOD.post)
      return API_URL.fileMaintenance.createUnitOfMeasurement;
    else if (method === METHOD.get)
      return API_URL.fileMaintenance.viewUnitOfMeasurement;
    else if (method === METHOD.put)
      return API_URL.fileMaintenance.updateUnitOfMeasurement;

    return API_URL.fileMaintenance.deleteUnitOfMeasurement;
  }

  private static getCategoryAPI(method?: METHOD): string {
    if (method === METHOD.post) return API_URL.fileMaintenance.createCategory;
    else if (method === METHOD.get) return API_URL.fileMaintenance.viewCategory;
    else if (method === METHOD.put)
      return API_URL.fileMaintenance.updateCategory;

    return API_URL.fileMaintenance.deleteCategory;
  }

  private static getDishAPI(method?: METHOD): string {
    if (method === METHOD.post) return API_URL.fileMaintenance.createDish;
    else if (method === METHOD.get) return API_URL.fileMaintenance.viewDish;
    else if (method === METHOD.put) return API_URL.fileMaintenance.updateDish;

    return API_URL.fileMaintenance.deleteDish;
  }

  private static getFoodPackageAPI(method?: METHOD): string {
    if (method === METHOD.post)
      return API_URL.fileMaintenance.createFoodPackage;
    else if (method === METHOD.get)
      return API_URL.fileMaintenance.viewFoodPackage;
    else if (method === METHOD.put)
      return API_URL.fileMaintenance.updateFoodPackage;

    return API_URL.fileMaintenance.deleteFoodPackage;
  }

  private static getEventAPI(method?: METHOD): string {
    if (method === METHOD.post) return API_URL.fileMaintenance.createEvent;
    else if (method === METHOD.get) return API_URL.fileMaintenance.viewEvent;
    else if (method === METHOD.put) return API_URL.fileMaintenance.updateEvent;

    return API_URL.fileMaintenance.deleteEvent;
  }

  private static getServiceAPI(method?: METHOD): string {
    if (method === METHOD.post) return API_URL.fileMaintenance.createService;
    else if (method === METHOD.get) return API_URL.fileMaintenance.viewService;
    else if (method === METHOD.put)
      return API_URL.fileMaintenance.updateService;

    return API_URL.fileMaintenance.deleteService;
  }

  private static getReservationAPI(method?: METHOD): string {
    if (method === METHOD.post) return API_URL.reservation.createReservation;
    else if (method === METHOD.get) return API_URL.reservation.viewReservation;
    else if (method === METHOD.put)
      return API_URL.reservation.updateReservation;

    return API_URL.reservation.deleteReservation;
  }

  private static getVenueAPI(method?: METHOD): string {
    if (method === METHOD.post) return API_URL.fileMaintenance.createVenue;
    else if (method === METHOD.get) return API_URL.fileMaintenance.viewVenue;
    else if (method === METHOD.put)
      return API_URL.fileMaintenance.updateVenue;

    return API_URL.fileMaintenance.deleteVenue;
  }
} 