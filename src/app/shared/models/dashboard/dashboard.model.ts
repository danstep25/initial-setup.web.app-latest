export interface IDashboardStats {
  totalReservations: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingPayments: number;
  upcomingReservations: number;
  completedReservations: number;
}

export interface IDashboardData {
  stats: IDashboardStats;
  recentTransactions: any[];
  recentReservations: any[];
}











