import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlojamientoService } from '../../../core/services/alojamiento.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdministradorService } from '../../../core/services/administrador.service';
import { Alojamiento } from '../../../core/models/alojamiento.model';

@Component({
  selector: 'app-mis-alojamientos',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="page-socio">
      <div class="page-header">
        <h2>Mis Alojamientos</h2>
        <a routerLink="/socio/alojamiento/nuevo" class="btn btn--primary">+ Nuevo</a>
      </div>

      <div class="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Ciudad</th>
              <th>Calificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (a of alojamientos(); track a.id) {
              <tr>
                <td>{{ a.nombre }}</td>
                <td>{{ a.tipo }}</td>
                <td>{{ a.ciudad }}</td>
                <td>⭐ {{ a.calificacionAvg | number:'1.1-1' }}</td>
                <td>
                  <a [routerLink]="['/socio/alojamiento', a.id, 'habitaciones']" class="btn btn--sm">Habitaciones</a>
                  <button class="btn btn--sm btn--danger" style="margin-left: 0.5rem;" (click)="eliminar(a.id)">Eliminar</button>
                </td>
              </tr>
            }
            @if (alojamientos().length === 0) {
              <tr>
                <td colspan="5" style="text-align: center; padding: 2rem;">
                  No tienes alojamientos registrados.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class MisAlojamientosComponent implements OnInit {
  alojamientos = signal<Alojamiento[]>([]);

  constructor(
    private alojamientoService: AlojamientoService,
    private authService: AuthService,
    private administradorService: AdministradorService
  ) {}

  ngOnInit() {
    console.log('=== MisAlojamientosComponent ngOnInit ===');
    const usuarioId = this.authService.currentUser()?.usuarioId;
    console.log('usuarioId:', usuarioId);

    if (!usuarioId) {
      console.error('No hay usuarioId en currentUser');
      return;
    }

    this.administradorService.getByUsuarioId(usuarioId).subscribe({
      next: (res) => {
        console.log('adminId obtenido:', res.data.id);
        this.cargarAlojamientos(res.data.id);
      },
      error: (err) => console.error('Error al obtener administrador', err)
    });
  }

  cargarAlojamientos(adminId: string) {
    const filtro = { registrosPorPagina: 100, adminId: adminId };
    console.log('Filtro enviado:', filtro);

    this.alojamientoService.getAll(filtro).subscribe({
      next: (res) => {
        console.log('Alojamientos recibidos:', res.data.items.length);
        this.alojamientos.set(res.data.items);
      },
      error: (err) => console.error('Error al cargar alojamientos', err)
    });
  }

  eliminar(id: string) {
    if (!confirm('¿Estás seguro de eliminar este alojamiento?')) return;
    this.alojamientoService.eliminar(id).subscribe({
      next: () => this.alojamientos.update(list => list.filter(a => a.id !== id)),
      error: (err) => alert('Error al eliminar: ' + (err.error?.message || 'Error'))
    });
  }
}