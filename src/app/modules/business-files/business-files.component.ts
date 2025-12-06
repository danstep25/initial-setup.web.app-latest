import { Component } from '@angular/core';
import { BaseModule } from '../../shared/modules/base.module';
import { MainBusinessFilesComponent } from './main-business-files/main-business-files.component';

@Component({
  selector: 'app-business-files',
  imports: [BaseModule, MainBusinessFilesComponent],
  templateUrl: './business-files.component.html',
  styleUrl: './business-files.component.scss'
})
  
export class BusinessFilesComponent {
  readonly labels = {
    title: 'Business Files'
  }
}
