import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../shared/constants/api.url.constant';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  constructor(private readonly _httpClient: HttpClient){}
  
  generate(){
    return this._httpClient.get(`${API_URL.reservation.generate}`);
  }

  generateIndividual(reservationId: number){
    return this._httpClient.get(`${API_URL.reservation.viewReservation}`, {
      params: { reservationId: reservationId.toString() }
    });
  }
}




