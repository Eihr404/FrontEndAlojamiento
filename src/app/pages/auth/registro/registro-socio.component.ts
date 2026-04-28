import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro-socio',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="public-layout">
      <div class="login-card" style="max-width: 450px;">
        <h1>Unirse como Socio</h1>
        <p style="text-align: center; color: gray; margin-bottom: 2rem;">
          Registra tu propiedad y comienza a recibir huéspedes.
        </p>

        <div *ngIf="error" class="alert alert--error">{{ error }}</div>
        <div *ngIf="exito" class="alert alert--success">{{ exito }}</div>

        <form #socioForm="ngForm" (ngSubmit)="registrar()">
          
          <div class="form-group">
            <label>Correo Electronico</label>
            <input 
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="ejemplo@hotel.com"
              required
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
              #emailInput="ngModel"
            />
            <div *ngIf="emailInput.invalid && emailInput.touched" style="color:red;">
              Ingresa un correo válido.
            </div>
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input 
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
              minlength="8"
              pattern="^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&._-])[A-Za-z\\d@$!%*#?&._-]{8,}$"
              #passwordInput="ngModel"
            />
            <div *ngIf="passwordInput.invalid && passwordInput.touched" style="color:red;">
              Mínimo 8 caracteres, incluye letras, números y símbolos.
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn--primary" 
            style="width: 100%;" 
            [disabled]="cargando || socioForm.invalid">
            {{ cargando ? 'Procesando solicitud...' : 'Crear Cuenta de Socio' }}
          </button>
        </form>

        <div class="login-footer" style="margin-top: 1rem;">
          ¿Ya eres socio? <a routerLink="/login">Inicia sesión aquí</a>
        </div>
      </div>
    </div>
  `
})
export class RegistroSocioComponent {
  email = '';
  password = '';
  cargando = false;
  error = '';
  exito = '';

  constructor(private auth: AuthService, private router: Router) {}

  registrar() {
    if (!this.email || !this.password) {
      this.error = 'Por favor, completa todos los campos.';
      return;
    }

    this.cargando = true;
    this.error = '';

    // Llamamos al método especializado para socios
    this.auth.registroSocio({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.exito = '¡Registro de socio exitoso! Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al registrar socio.';
        this.cargando = false;
      }
    });
  }
}