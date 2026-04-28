import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap, map } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = `${environment.apiUrl}/auth`;

  // Signal reactivo que guarda el estado de sesión en memoria
  currentUser = signal<LoginResponse | null>(this.loadFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

// src/app/core/services/auth.service.ts
login(credentials: LoginRequest): Observable<LoginResponse> {
  return this.http.post<ApiResponse<LoginResponse>>(`${this.BASE}/login`, credentials).pipe(
    tap(res => {
      // Guardar token y usuario en localStorage
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('auth_user', JSON.stringify(res.data));
      this.currentUser.set(res.data);
    }),
    map(res => res.data) // ← extraer solo el LoginResponse
  );
}

// Cambia esto:
  registro(payload: any) {
    // Asegúrate de que el objeto que envías use "email" (o como se llame en tu DTO de C#)
    return this.http.post<ApiResponse<boolean>>(`${this.BASE}/registro`, {
      email: payload.correoElectronico, // <-- Aquí está el truco
      password: payload.password
    });
  }

  registroSocio(payload: any) {
    return this.http.post<ApiResponse<boolean>>(`${this.BASE}/registro-socio`, {
      email: payload.email,
      password: payload.password
    });
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // auth.service.ts
  isAdmin(): boolean {
    const roles = this.currentUser()?.roles ?? [];
    return roles.includes('Administrador') || 
          roles.includes('Socio') || 
          roles.includes('Admin_Sitio');
  }

  private loadFromStorage(): LoginResponse | null {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  }

getUserIdFromToken(): string | null {
  const token = this.getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded['usuarioId'] ?? null;  // ← claim exacto que agregamos
  } catch {
    return null;
  }
}

}