import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `    
    <div class="login-card">
      <h1>Crear cuenta</h1>

      <div *ngIf="error" class="alert alert--error">{{ error }}</div>
      <div *ngIf="exito" class="alert alert--success">{{ exito }}</div>

      <form #registroForm="ngForm" (ngSubmit)="registrar()">
        
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
            Ingresa un correo válido (ej: nombre@empresa.com)
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
            La contraseña debe tener al menos 8 caracteres, incluir letras, números y un símbolo.
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn--primary" 
          [disabled]="cargando || registroForm.invalid">
          {{ cargando ? 'Registrando...' : 'Registrarme' }}
        </button>

      </form>

      <p class="login-footer">
        ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a>
      </p>
    </div>
  `
})
export class RegistroComponent {
  email = '';
  password = '';
  cargando = false;
  error = '';
  exito = '';

  constructor(private auth: AuthService, private router: Router) {}

registrar() {
  // Usamos 'cargando' para que coincida con el [disabled] y el texto del HTML
  this.cargando = true; 
  this.error = '';
  this.exito = '';

  // Tip: Asegúrate de que los nombres de los campos coincidan con lo que espera tu Backend
  this.auth.registro({ correoElectronico: this.email, password: this.password })
    .subscribe({
      next: () => {
        this.exito = 'Cuenta creada con éxito. Redirigiendo al login...';
        // En éxito no hace falta poner cargando = false si vamos a redirigir, 
        // pero es buena práctica por si la navegación tarda.
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        // Aquí es donde liberamos el botón para que el usuario pueda corregir los datos
        this.error = err?.error?.message ?? 'El correo ya existe o los datos son inválidos.';
        this.cargando = false; 
        console.error('Error capturado:', err);
      }
    });
  }
}