export const API_URL = {
  security: {
    authentication: 'Security/authentication.php',
  },
  admin: {
    //Users
    user: 'Users/getAllUsers.php',
    createUser: 'Users/createUser.php',
    updateUser: 'Users/updateUser.php',
    deleteUser: 'Users/deleteUser.php',
    viewUser: 'Users/getUserById.php',
    deactivateUser: 'Users/deactivateUser.php',
    generate: 'Users/generateAllUsers.php',

    //UserGroups
    userGroup: 'UserGroups/getAllUserGroups.php',
    createUserGroup: 'UserGroups/createUserGroup.php',
    updateUserGroup: 'UserGroups/updateUserGroup.php',
    deleteUserGroup: 'UserGroups/deleteUserGroup.php',
    viewUserGroup: 'UserGroups/getUserGroupById.php',
  },
  fileMaintenance: {
    //Supplier
    supplier: 'Suppliers/getAllSuppliers.php',
    createSupplier: 'Suppliers/createSupplier.php',
    updateSupplier: 'Suppliers/updateSupplier.php',
    deleteSupplier: 'Suppliers/deleteSupplier.php',
    viewSupplier: 'Suppliers/getSupplierById.php',
    supplierOptions: 'Suppliers/getAllSuppliersOption.php',

    //Ingredients
    ingredient: 'Ingredients/getAllIngredients.php',
    createIngredient: 'Ingredients/createIngredient.php',
    updateIngredient: 'Ingredients/updateIngredient.php',
    deleteIngredient: 'Ingredients/deleteIngredient.php',
    viewIngredient: 'Ingredients/getIngredientById.php',
    ingredientOptions: 'Ingredients/getAllIngredientsOption.php',

    //Unit Of Measurement
    unitOfMeasurement: 'UnitOfMeasurements/getAllUnitOfMeasurements.php',
    createUnitOfMeasurement: 'UnitOfMeasurements/createUnitOfMeasurement.php',
    updateUnitOfMeasurement: 'UnitOfMeasurements/updateUnitOfMeasurement.php',
    deleteUnitOfMeasurement: 'UnitOfMeasurements/deleteUnitOfMeasurement.php',
    viewUnitOfMeasurement: 'UnitOfMeasurements/getUnitOfMeasurementById.php',
    unitOfMeasurementOptions:
      'UnitOfMeasurements/getAllUnitOfMeasurementsOption.php',

    //Categories
    category: 'Categories/getAllCategories.php',
    createCategory: 'Categories/createCategory.php',
    updateCategory: 'Categories/updateCategory.php',
    deleteCategory: 'Categories/deleteCategory.php',
    viewCategory: 'Categories/getCategoryById.php',
    categoryOptions: 'Categories/getAllCategoriesOption.php',
    generateCategory: 'Categories/generateAllCategories.php',

    //Dishes
    dish: 'Dishes/getAllDishes.php',
    createDish: 'Dishes/createDish.php',
    updateDish: 'Dishes/updateDish.php',
    deleteDish: 'Dishes/deleteDish.php',
    viewDish: 'Dishes/getDishById.php',
    DishOptions: 'Dishes/getAllDishesOption.php',
    generateDish: 'Dishes/generateAllDishes.php',

    //FoodPackages
    foodPackage: 'FoodPackages/getAllFoodPackages.php',
    createFoodPackage: 'FoodPackages/createFoodPackage.php',
    updateFoodPackage: 'FoodPackages/updateFoodPackage.php',
    deleteFoodPackage: 'FoodPackages/deleteFoodPackage.php',
    viewFoodPackage: 'FoodPackages/getFoodPackageById.php',
    foodPackageOptions: 'FoodPackages/getAllFoodPackagesOption.php',
    generateFoodPackage: 'FoodPackages/generateAllFoodPackages.php',

    //Events
    event: 'Events/getAllEvents.php',
    createEvent: 'Events/createEvent.php',
    updateEvent: 'Events/updateEvent.php',
    deleteEvent: 'Events/deleteEvent.php',
    viewEvent: 'Events/getEventById.php',
    EventOptions: 'Events/getAllEventsOption.php',
    generateEvent: 'Events/generateAllEvents.php',

    //Service
    service: 'Services/getAllServices.php',
    createService: 'Services/createService.php',
    updateService: 'Services/updateService.php',
    deleteService: 'Services/deleteService.php',
    viewService: 'Services/getServiceById.php',
    ServiceOptions: 'Services/getAllServicesOption.php',
    generateService: 'Services/generateAllServices.php',

    //Venues
    venue: 'Venues/getAllVenues.php',
    createVenue: 'Venues/createVenue.php',
    updateVenue: 'Venues/updateVenue.php',
    deleteVenue: 'Venues/deleteVenue.php',
    viewVenue: 'Venues/getVenueById.php',
    VenueOptions: 'Venues/getAllVenuesOption.php',
    generateVenue: 'Venues/generateAllVenues.php',
  },

  //Reservation
  reservation: {
    reservation: 'Reservations/getAllReservations.php',
    createReservation: 'Reservations/createReservation.php',
    updateReservation: 'Reservations/updateReservation.php',
    deleteReservation: 'Reservations/deleteReservation.php',
    viewReservation: 'Reservations/getReservationById.php',
    generate: 'Reservations/generateAllReservations.php',
  },

  //Transaction
  transaction: {
    transaction: 'Transactions/getAllTransactions.php',
    updateTransaction: 'Transactions/updateTransaction.php',
    generate: 'Transactions/generateAllTransactions.php'
  },

  //Audit
  audit: {
    audit: 'Audits/getAllAudits.php',
    createAudit: 'Audits/createAudit.php',
    generate: 'Audits/generateAllAudits.php',
  },
};
