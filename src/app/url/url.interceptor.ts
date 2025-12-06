import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environment/environment.test';

export const urlInterceptor: HttpInterceptorFn = (req, next) => {
   if (req.url) {
      const apiReq = req.clone({
        url: `${environment.apiUrl}${req.url}`
      });
      return next(apiReq);
  }
  
  return next(req);
};
