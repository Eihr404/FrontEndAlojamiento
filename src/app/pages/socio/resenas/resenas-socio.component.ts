import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AdministradorService } from '../../../core/services/administrador.service';
import { AlojamientoService } from '../../../core/services/alojamiento.service';
import { ResenaService, ResenaResponse } from '../../../core/services/resena.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-resenas-socio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-socio">
      <div class="page-header">
        <h2>Reseñas de mis alojamientos</h2>
        <p style="color:var(--color-texto-suave);">
          Lo que dicen tus huéspedes
        </p>
      </div>

      <div *ngIf="cargando()" style="text-align:center; padding:3rem;">
        <p>Cargando reseñas... ⏳</p>
      </div>

      <div *ngIf="!cargando() && resenas().length === 0"
           style="text-align:center; padding:3rem; color:gray;">
        <p>Aún no tienes reseñas en tus alojamientos.</p>
      </div>

      <div *ngIf="!cargando() && resenas().length > 0" class="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Alojamiento</th>
              <th>Calificación</th>
              <th>Comentario</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            @for (r of resenas(); track r.id) {
              <tr>
                <td>{{ r.nombreAlojamiento }}</td>
                <td>
                  <span style="color:#f5a623; font-size:1.1rem;">
                    {{ estrellasTexto(r.estrellas) }}
                  </span>
                  <span style="font-size:0.85rem; color:gray;">
                    ({{ r.estrellas }}/5)
                  </span>
                </td>
                <td>{{ r.comentario || 'Sin comentario' }}</td>
                <td>{{ r.fecha | date:'dd/MM/yyyy' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class ResenasSocioComponent implements OnInit {
  resenas  = signal<any[]>([]);
  cargando = signal(false);

  constructor(
    private authService:          AuthService,
    private administradorService: AdministradorService,
    private alojamientoService:   AlojamientoService,
    private resenaService:        ResenaService
  ) {}

  ngOnInit() { this.cargarResenas(); }

  cargarResenas() {
    this.cargando.set(true);
    const usuarioId = this.authService.currentUser()?.usuarioId;
    if (!usuarioId) { this.cargando.set(false); return; }

    this.administradorService.getByUsuarioId(usuarioId).subscribe({
      next: (adminRes) => {
        const adminId = adminRes.data.id;

        // Obtener alojamientos del socio
        this.alojamientoService.getAll({ adminId, registrosPorPagina: 100 }).subscribe({
          next: (alojRes) => {
            const alojamientos = alojRes.data.items;
            if (alojamientos.length === 0) {
              this.cargando.set(false);
              return;
            }

            // Obtener reseñas de cada alojamiento
            const requests = alojamientos.map(a =>
              this.resenaService.getPorAlojamiento(a.id).pipe(
                map(res => res.data.map(r => ({
                  ...r,
                  nombreAlojamiento: a.nombre
                })))
              )
            );

            forkJoin(requests).subscribe({
              next: (resultados) => {
                const todas = resultados.flat()
                  .sort((a, b) =>
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                  );
                this.resenas.set(todas);
                this.cargando.set(false);
              },
              error: () => this.cargando.set(false)
            });
          },
          error: () => this.cargando.set(false)
        });
      },
      error: () => this.cargando.set(false)
    });
  }

  estrellasTexto(n: number): string {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }
}