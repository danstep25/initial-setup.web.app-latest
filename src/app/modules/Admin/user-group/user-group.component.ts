import { Component } from '@angular/core';
import { BaseModule } from '../../../shared/modules/base.module';
import { UserGroupListComponent } from './user-group-list/user-group-list.component';

@Component({
  selector: 'app-user-group',
  imports: [BaseModule, UserGroupListComponent],
  templateUrl: './user-group.component.html',
  styleUrl: './user-group.component.scss',
})
export class UserGroupComponent {
  readonly labels = {
    title: 'User Groups',
  };
}
