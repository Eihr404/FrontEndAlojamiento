import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="login-card">
        <h1>Iniciar sesión</h1>

        <div *ngIf="error" class="alert alert--error">{{ error }}</div>

        <form #loginForm="ngForm" (ngSubmit)="login()">

          <div class="form-group">
            <label>Correo electrónico</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              placeholder="tucorreo@ejemplo.com" 
              required 
              #emailInput="ngModel" 
            />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              placeholder="••••••••" 
              required 
              #passInput="ngModel" 
            />
          </div>

          <button 
            type="submit" 
            class="btn btn--primary" 
            [disabled]="loading || loginForm.invalid">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>

        </form>

        <p class="login-footer">
          ¿No tienes cuenta? <a routerLink="/registro">Regístrate</a>
        </p>

        <p style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 1rem;">
          ¿Quieres hospedar? <a routerLink="/registro-socio" style="font-weight: bold; color: var(--color-exito);">Regístrate como Socio</a>
        </p>
      </div>
    `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.error = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
    next: (res) => {
      this.loading = false;
      
      const roles = (res?.roles || []).map((r: string) => r.trim().toLowerCase());
      console.log('Roles normalizados:', roles);

      if (roles.includes('socio') || roles.includes('administrador') || roles.includes('admin_sitio')) {
        this.router.navigate(['/socio/mis-alojamientos']);
      } else {
        this.router.navigate(['/cliente/buscar']);
      }
    },
      error: (err) => {
        console.error('Error en el login:', err);
        this.error = err?.error?.message ?? 'Credenciales incorrectas';
        this.loading = false;
      }
    });
  }
}