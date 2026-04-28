import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
 
export interface CrearFacturaRequest {
  reservaId:    string;
  metodoPagoId: string;
}
 
export interface FacturaResponse {
  id:           string;
  reservaId:    string;
  numFactura?:   string;
  fechaEmision: string;
  metodoPagoId: string;
  estadoPago:   string;
}
 
@Injectable({ providedIn: 'root' })
export class FacturaService {
  private readonly BASE = `${environment.apiUrl}/facturas`;
  constructor(private http: HttpClient) {}
 
  crear(payload: CrearFacturaRequest) {
    return this.http.post<ApiResponse<FacturaResponse>>(this.BASE, payload);
  }
 
  getById(id: string) {
    return this.http.get<ApiResponse<FacturaResponse>>(`${this.BASE}/${id}`);
  }
 
  getPorReserva(reservaId: string) {
    return this.http.get<ApiResponse<FacturaResponse>>(`${this.BASE}/reserva/${reservaId}`);
  }
}
 