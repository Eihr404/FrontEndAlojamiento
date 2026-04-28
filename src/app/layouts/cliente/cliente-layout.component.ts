import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <nav class="sidebar sidebar--cliente">
        <div class="sidebar__logo">🏠 Alojamientos</div>
        <ul class="sidebar__nav">
          <li><a routerLink="/cliente/buscar" routerLinkActive="active">Buscar</a></li>
          <li><a routerLink="/cliente/mis-reservas" routerLinkActive="active">Mis Reservas</a></li>
          <li><a routerLink="/cliente/perfil" routerLinkActive="active">Mi Perfil</a></li>
        </ul>
        <button class="btn-logout" (click)="auth.logout()">Salir</button>
      </nav>
      <main class="content-area">
        <router-outlet />
      </main>
    </div>
  `
})
export class ClienteLayoutComponent {
  constructor(public auth: AuthService) {}
}