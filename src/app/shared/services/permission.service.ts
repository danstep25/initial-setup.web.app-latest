import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class PermissionService {

  hasPermission(){
    const { role } = JSON?.parse(sessionStorage.getItem('userInfo'))
    if(role === 'staff')
      return false;

    return true;
  }
}
