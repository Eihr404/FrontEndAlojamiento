import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import { Alojamiento, AlojamientoFiltro, CrearAlojamientoRequest } from '../models/alojamiento.model';

@Injectable({ providedIn: 'root' })
export class AlojamientoService {
  private readonly BASE = `${environment.apiUrl}/alojamientos`;

  constructor(private http: HttpClient) {}

  getAll(filtro: AlojamientoFiltro = {}) {
    let params = new HttpParams();
    Object.entries(filtro).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<ApiResponse<PagedResult<Alojamiento>>>(this.BASE, { params });
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Alojamiento>>(`${this.BASE}/${id}`);
  }

  crear(payload: CrearAlojamientoRequest) {
    return this.http.post<ApiResponse<Alojamiento>>(this.BASE, payload);
  }

  actualizar(payload: Alojamiento) {
    return this.http.put<ApiResponse<Alojamiento>>(this.BASE, payload);
  }

  eliminar(id: string) {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}