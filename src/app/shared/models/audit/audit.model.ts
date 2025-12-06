import { IPagination } from '../required/pagination.model';

interface IAudit extends IAuditForm {
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditForm {
  username: string,
  action: string,
  module: string,
  description: string
};

export type IAuditList = IPagination<IAudit>;
