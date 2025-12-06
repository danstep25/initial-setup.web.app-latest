import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IToast, IToastInfo } from '../models/required/toast.model';
import { ICON, TOAST_TYPE } from '../constants/icon.constant';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  
  private readonly _toast$ = new BehaviorSubject<IToastInfo>(null);
  toast$ = this._toast$.asObservable();
  constructor() { 

  }

  show(title: string, message: string = null) {
    
    this._toast$.next(this.toastType(title, message));
    setTimeout(() => {
      this._toast$.next(null);
    }, 3000);
  }

  private toastType(type: string, message: string = null): IToastInfo {
    switch (type) {
      case TOAST_TYPE.success:
        return { ...ICON.prompt.success, subtitle: message } as IToastInfo;
      
      case TOAST_TYPE.error:
        return { ...ICON.prompt.error, subtitle: message } as IToastInfo;
      
      case TOAST_TYPE.warning:
        return { ...ICON.prompt.warning, subtitle: message } as IToastInfo;
    }
  }
}
