import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-socio-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <nav class="sidebar sidebar--socio">
        <div class="sidebar__logo">🏨 Panel Socio</div>
        <ul class="sidebar__nav">
          <li><a routerLink="/socio/mis-alojamientos" routerLinkActive="active">Mis Alojamientos</a></li>
          <li><a routerLink="/socio/reservas-entrantes" routerLinkActive="active">Reservas</a></li>
          <li><a routerLink="/socio/perfil" routerLinkActive="active">Mi Perfil</a></li>
        </ul>
        <button class="btn-logout" (click)="auth.logout()">Salir</button>
      </nav>
      <main class="content-area">
        <router-outlet />
      </main>
    </div>
  `
})
export class SocioLayoutComponent {
  constructor(public auth: AuthService) {}
}