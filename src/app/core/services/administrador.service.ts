// src/app/core/services/administrador.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface AdministradorResponse {
  id: string;
  usuarioId: string;
  nombreComercial: string;
  nitTax: string;
  telefonoSoporte: string;
}

@Injectable({ providedIn: 'root' })
export class AdministradorService {
  private readonly BASE = `${environment.apiUrl}/administradores`;

  constructor(private http: HttpClient) {}

  getByUsuarioId(usuarioId: string): Observable<ApiResponse<AdministradorResponse>> {
    return this.http.get<ApiResponse<AdministradorResponse>>(
      `${this.BASE}/por-usuario/${usuarioId}`
    );
  }
}