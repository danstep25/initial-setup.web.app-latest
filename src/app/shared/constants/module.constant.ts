export enum MODULE {
  dashboard = 'Dashboard',
  user = 'Users',
  userGroup = 'UserGroups',
  businessFile = 'BusinessFiles',
  supplier = 'Supplier',
  ingredients = 'Ingredients',
  unitOfMeasurement = 'Units',
  category = 'Categories',
  dish = 'FoodMenu',
  foodPackage = 'FoodPackages',
  event = 'Events',
  service = 'Services',
  reservation = 'Reservations',
  venue = 'Venues',
  transaction = 'Transactions',
  audit = 'Audits',
  reports = 'Reports'
}

export enum METHOD {
  post = 'POST',
  put = 'PUT',
  get = 'GET',
  delete = 'DELETE'
}

export enum STATUS {
  pending = 'PENDING',
  active = 'ACTIVE',
  cancelled = 'CANCELLED'
}