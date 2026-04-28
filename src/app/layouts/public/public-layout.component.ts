import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="public-layout">
      <header class="public-header">
        <span class="logo">🏠 Alojamientos</span>
      </header>
      <main class="public-main">
        <router-outlet />
      </main>
    </div>
  `
})
export class PublicLayoutComponent {}