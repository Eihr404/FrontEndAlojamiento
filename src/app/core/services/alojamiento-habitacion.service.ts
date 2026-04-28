import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface CrearAlojamientoHabitacionRequest {
  alojamientoId: string;
  habitacionId:  string;
  precioNoche:   number;
  cantidadTotal: number;
}

@Injectable({ providedIn: 'root' })
export class AlojamientoHabitacionService {
  private readonly BASE = `${environment.apiUrl}/alojamientos`;

  constructor(private http: HttpClient) {}

  getPorAlojamiento(alojamientoId: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(
      `${this.BASE}/${alojamientoId}/habitaciones`
    );
  }

  crear(req: CrearAlojamientoHabitacionRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.BASE}/habitaciones`, req
    );
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/habitaciones/${id}`);
  }
}