import { INavigation } from "../models/navigation";

const FileMaintenanceList: Array<INavigation> = [
  // {
  //   module: 'Supplier',
  //   icon: 'contacts_product',
  // },

  // {
  //   module: 'Ingredients',
  //   icon: 'fastfood',
  // },

  // {
  //   module: 'Units',
  //   icon: 'scale',
  // },

  {
    module: 'Categories',
    icon: 'category',
  },

  {
    module: 'Food Menu',
    icon: 'menu_book_2',
  },

  {
    module: 'Food Packages',
    icon: 'fastfood',
  },

  {
    module: 'Events',
    icon: 'celebration',
  },

  {
    module: 'Services',
    icon: 'room_service',
  },

  {
    module: 'Venues',
    icon: 'theaters',
  },
];

export const NavigationList: Array<INavigation> = [
  {
    module: 'Dashboard',
    icon: 'home',
  },

  {
    module: 'Users',
    icon: 'account_circle',
  },

  {
    module: 'File Maintenance',
    subModules: FileMaintenanceList,
    icon: 'folder_managed',
  },

  {
    module: 'Reservations',
    icon: 'calendar_month',
  },

  {
    module: 'Transactions',
    icon: 'credit_card',
  },

  {
    module: 'Audits',
    icon: 'content_paste_search',
  },
];