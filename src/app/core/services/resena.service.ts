import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface CrearResenaRequest {
  clienteId:     string;
  alojamientoId: string;
  estrellas:     number;
  comentario?:   string;
}

export interface ResenaResponse {
  id:            string;
  clienteId:     string;
  alojamientoId: string;
  estrellas:     number;
  comentario?:   string;
  fecha:         string;
}

@Injectable({ providedIn: 'root' })
export class ResenaService {
  private readonly BASE = `${environment.apiUrl}/resenas`;

  constructor(private http: HttpClient) {}

  crear(req: CrearResenaRequest): Observable<ApiResponse<ResenaResponse>> {
    return this.http.post<ApiResponse<ResenaResponse>>(this.BASE, req);
  }

  getPorAlojamiento(alojamientoId: string): Observable<ApiResponse<ResenaResponse[]>> {
    return this.http.get<ApiResponse<ResenaResponse[]>>(
      `${this.BASE}/alojamiento/${alojamientoId}`
    );
  }
}