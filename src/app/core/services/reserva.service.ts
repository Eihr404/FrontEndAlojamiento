import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Reserva, CrearReservaRequest } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly BASE = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  crear(payload: CrearReservaRequest) {
    return this.http.post<ApiResponse<Reserva>>(this.BASE, payload);
  }

  getPorAdmin(adminId: string) {
  return this.http.get<ApiResponse<Reserva[]>>(
    `${this.BASE}/admin/${adminId}`
  );
  }

  getById(id: string) {
    return this.http.get<ApiResponse<Reserva>>(`${this.BASE}/${id}`);
  }

  getPorCliente(clienteId: string) {
    return this.http.get<ApiResponse<Reserva[]>>(`${this.BASE}/cliente/${clienteId}`);
  }

  cambiarEstado(id: string, estado: string) {
    return this.http.patch<void>(`${this.BASE}/${id}/estado`, JSON.stringify(estado), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  cancelar(id: string) {
    return this.http.post<void>(`${this.BASE}/${id}/cancelar`, {});
  }
}