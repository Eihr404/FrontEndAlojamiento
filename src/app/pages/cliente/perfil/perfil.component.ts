import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-perfil" style="max-width: 600px; margin: 0 auto; padding-top: 2rem;">
      <div class="card-alojamiento" style="text-align: center; padding: 3rem 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">👤</div>
        <h2>Mi Perfil</h2>
        <p style="color: gray; margin-bottom: 2rem;">Portal de Cliente</p>

        <div style="text-align: left; background: #f9f9f9; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
          <p style="margin-bottom: 0.5rem;"><strong>ID de Usuario:</strong> {{ usuario()?.userName }}</p>
          <p style="margin-bottom: 0.5rem;"><strong>Correo Electrónico:</strong> {{ usuario()?.correoElectronico }}</p>
          <p><strong>Rol:</strong> {{ usuario()?.roles?.join(', ') || 'Cliente' }}</p>
        </div>

        <button class="btn btn--danger" style="width: 100%;" (click)="auth.logout()">Cerrar Sesión</button>
      </div>
    </div>
  `
})
export class PerfilClienteComponent {
  auth = inject(AuthService);
  usuario = this.auth.currentUser;
}