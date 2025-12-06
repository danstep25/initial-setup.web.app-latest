import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpStatusCode,
} from '@angular/common/http';
import { IResponse } from '../models/required/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class ApiBase {
  protected handleError(err: HttpErrorResponse): Observable<never> {
    let errorMessage: string = '';
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    console.warn('error', err);
    if (err.error.code === HttpStatusCode.Unauthorized) {
      errorMessage = `${err.error.message}`;
    }

    else if (err.error.code === HttpStatusCode.Conflict) {
      errorMessage = `${err.error.message}`;
    }
    // if (err.error instanceof ErrorEvent) {
    //   // A client-side or network error occurred. Handle it accordingly.
    //   errorMessage = `An error occurred: ${err.error.message}`;
    // } else if (err.error instanceof ProgressEvent) {
    //   errorMessage =
    //     'Unable to connect. This might be due to network issues or server downtime. Please try again shortly.';
    // } else if (err.error?.errors && err.status === HttpStatusCode.BadRequest) {
    //   errorMessage = JSON.stringify(err.error.errors);
    // }
    else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage =
        'An error occurred while processing your request. Please contact system administrator!';
    }

    // Log the error message
    console.error(errorMessage);

    return throwError(() => errorMessage);
  }

  protected buildHttpParams(paramsObj: { [key: string]: any }): HttpParams {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach((key) => {
      if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
        params = params.set(key, paramsObj[key].toString());
      }
    });
    return params;
  }
}
