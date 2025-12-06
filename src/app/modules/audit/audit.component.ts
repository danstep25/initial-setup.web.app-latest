import { Component } from '@angular/core';
import { BaseModule } from '../../shared/modules/base.module';
import { AuditListComponent } from './audit-list/audit-list.component';

@Component({
  selector: 'app-audit',
  imports: [AuditListComponent, BaseModule],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AuditComponent {
readonly labels = {
    title: 'Audit',
  };
}
