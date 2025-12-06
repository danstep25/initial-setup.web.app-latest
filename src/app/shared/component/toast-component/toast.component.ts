import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { BaseModule } from '../../modules/base.module';

@Component({
  selector: 'app-toast-component',
  standalone: true,
  imports: [BaseModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponentComponent {
  toast$: any = null;

  constructor(private toastService: ToastService) {
    this.toast$ = this.toastService.toast$;
  }
}
