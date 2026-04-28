import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
 
export interface Cliente {
  id: string;
  usuarioId: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  documentoIdentidad?: string;
}
 
export interface CrearClienteRequest {
  usuarioId: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  documentoIdentidad?: string;
}
 
@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly BASE = `${environment.apiUrl}/clientes`;
 
  constructor(private http: HttpClient) {}
 
  // GET /clientes/usuario/{usuarioId}  ← endpoint que agregamos al backend
  getByUsuarioId(usuarioId: string) {
    return this.http.get<ApiResponse<Cliente>>(`${this.BASE}/usuario/${usuarioId}`);
  }
 
  getById(id: string) {
    return this.http.get<ApiResponse<Cliente>>(`${this.BASE}/${id}`);
  }
 
  crear(payload: CrearClienteRequest) {
    return this.http.post<ApiResponse<Cliente>>(this.BASE, payload);
  }
 
  actualizar(payload: Cliente & { id: string }) {
    return this.http.put<ApiResponse<Cliente>>(this.BASE, payload);
  }
}