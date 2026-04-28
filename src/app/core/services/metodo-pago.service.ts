import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
 
export interface MetodoPago {
  id:     string;
  nombre: string;
}
 
@Injectable({ providedIn: 'root' })
export class MetodoPagoService {
  private readonly BASE = `${environment.apiUrl}/metodos-pago`;
  constructor(private http: HttpClient) {}
 
  getAll() {
    return this.http.get<ApiResponse<MetodoPago[]>>(this.BASE);
  }
}
 