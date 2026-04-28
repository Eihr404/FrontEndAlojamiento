import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Habitacion, CrearHabitacionRequest } from '../models/habitacion.model';

@Injectable({ providedIn: 'root' })
export class HabitacionService {
  private readonly BASE = `${environment.apiUrl}/habitaciones`;

  constructor(private http: HttpClient) {}

  getPorAlojamiento(alojamientoId: string) {
    return this.http.get<ApiResponse<Habitacion[]>>(
      `${this.BASE}/alojamiento/${alojamientoId}`
    );
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Habitacion>>(`${this.BASE}/${id}`);
  }

  crear(payload: CrearHabitacionRequest) {
    return this.http.post<ApiResponse<Habitacion>>(this.BASE, payload);
  }

  actualizar(payload: Habitacion) {
    return this.http.put<ApiResponse<Habitacion>>(this.BASE, payload);
  }

  eliminar(id: string) {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}