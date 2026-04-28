import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { HabitacionService } from '../../../core/services/habitacion.service';
import { AlojamientoHabitacionService } from '../../../core/services/alojamiento-habitacion.service';
import { Habitacion, CrearHabitacionRequest } from '../../../core/models/habitacion.model';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="page-socio">
      <div class="page-header">
        <h2>Gestión de Habitaciones</h2>
        <a routerLink="/socio/mis-alojamientos" class="btn btn--outline">← Volver</a>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">

        <!-- Formulario -->
        <div class="card-alojamiento" style="padding: 1.5rem;">
          <h3>Nueva Habitación</h3>
          <div *ngIf="error" class="alert alert--error">{{ error }}</div>

        <!-- Reemplaza el input de texto por un select -->
        <div class="form-group" style="margin-top: 1rem;">
          <label>Tipo de habitación *</label>
          <select [(ngModel)]="nuevaHabitacion.nombreTipo">
            <option value="">Seleccionar tipo...</option>
            <option value="Individual">Individual</option>
            <option value="Doble">Doble</option>
            <option value="Familiar">Familiar</option>
            <option value="Suite">Suite</option>
            <option value="Deluxe">Deluxe</option>
          </select>
        </div>

          <div style="display: flex; gap: 1rem;">
            <div class="form-group" style="flex: 1;">
              <label>Capacidad (personas) *</label>
              <input type="number" [(ngModel)]="nuevaHabitacion.capacidadPersonas" min="1" />
            </div>
            <div class="form-group" style="flex: 1;">
              <label>N° de camas *</label>
              <input type="number" [(ngModel)]="nuevaHabitacion.numeroCamas" min="1" />
            </div>
          </div>

          <div style="display: flex; gap: 1rem;">
            <div class="form-group" style="flex: 1;">
              <label>Precio por noche *</label>
              <input type="number" [(ngModel)]="precioPorNoche" min="0" />
            </div>
            <div class="form-group" style="flex: 1;">
              <label>Cantidad disponible *</label>
              <input type="number" [(ngModel)]="cantidadTotal" min="1" />
            </div>
          </div>

          <button class="btn btn--primary" (click)="crear()"
                  [disabled]="cargando" style="width: 100%; margin-top: 1rem;">
            {{ cargando ? 'Agregando...' : 'Agregar Habitación' }}
          </button>
        </div>

        <!-- Tabla -->
        <div class="tabla-container">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Capacidad</th>
                <th>Camas</th>
                <th>Precio/noche</th>
                <th>Disponibles</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (h of habitaciones(); track h.id) {
                <tr>
                  <td>{{ h.nombreTipo }}</td>
                  <td>👤 {{ h.capacidadPersonas }}</td>
                  <td>🛏️ {{ h.numeroCamas }}</td>
                  <td>$ {{ h.precioNoche }}</td>
                  <td>{{ h.cantidadTotal }}</td>
                  <td>
                    <button class="btn btn--sm btn--danger" (click)="eliminar(h.id)">
                      Eliminar
                    </button>
                  </td>
                </tr>
              }
              @if (habitaciones().length === 0) {
                <tr>
                  <td colspan="6" style="text-align:center; padding:2rem;">
                    No hay habitaciones registradas.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class HabitacionesComponent implements OnInit {
  alojamientoId = '';
  habitaciones  = signal<any[]>([]);
  cargando      = false;
  error         = '';
  precioPorNoche = 50;
  cantidadTotal  = 1;

  nuevaHabitacion: CrearHabitacionRequest = {
    nombreTipo: '',
    capacidadPersonas: 2,
    numeroCamas: 1
  };

  constructor(
    private route: ActivatedRoute,
    private habitacionService: HabitacionService,
    private alojamientoHabitacionService: AlojamientoHabitacionService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.alojamientoId = id;
      this.cargarHabitaciones();
    }
  }

  cargarHabitaciones() {
  this.alojamientoHabitacionService.getPorAlojamiento(this.alojamientoId).subscribe({
    next: (res) => {
      const relaciones = res.data;

      if (relaciones.length === 0) {
        this.habitaciones.set([]);
        return;
      }

      const requests = relaciones.map((rel: any) =>
        this.habitacionService.getById(rel.habitacionId).pipe(
          map(h => ({
            id:                rel.id,
            nombreTipo:        h.data.nombreTipo,
            capacidadPersonas: h.data.capacidadPersonas,
            numeroCamas:       h.data.numeroCamas,
            precioNoche:       rel.precioNoche,
            cantidadTotal:     rel.cantidadTotal
          }))
        )
      );

        forkJoin(requests).subscribe({
          next: (items) => this.habitaciones.set(items as any[]),
          error: (err) => console.error('Error enriqueciendo habitaciones', err)
        });
      },
      error: (err) => console.error('Error cargando relaciones', err)
    });
  }

  crear() {
    this.error = '';

    if (!this.nuevaHabitacion.nombreTipo ||
        this.nuevaHabitacion.capacidadPersonas < 1 ||
        this.nuevaHabitacion.numeroCamas < 1 ||
        this.precioPorNoche < 0 ||
        this.cantidadTotal < 1) {
      this.error = 'Completa todos los campos obligatorios.';
      return;
    }

    this.cargando = true;

    // Paso 1 — crear la habitación
    this.habitacionService.crear(this.nuevaHabitacion).subscribe({
      next: (res) => {
        const habitacionId = res.data.id;

        // Paso 2 — vincular al alojamiento con precio
        this.alojamientoHabitacionService.crear({
          alojamientoId: this.alojamientoId,
          habitacionId:  habitacionId,
          precioNoche:   this.precioPorNoche,
          cantidadTotal: this.cantidadTotal
        }).subscribe({
          next: (rel) => {
            this.habitaciones.update(list => [...list, rel.data]);
            this.cargando = false;
            this.resetForm();
          },
          error: () => {
            this.error = 'Habitación creada pero no se pudo asignar el precio.';
            this.cargando = false;
          }
        });
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Error al crear la habitación.';
        this.cargando = false;
      }
    });
  }

  eliminar(id: string) {
    if (!confirm('¿Eliminar esta habitación?')) return;
    this.alojamientoHabitacionService.eliminar(id).subscribe({
      next: () => this.habitaciones.update(list => list.filter(h => h.id !== id)),
      error: (err) => alert('Error al eliminar: ' + (err.error?.message || 'Error'))
    });
  }

  resetForm() {
    this.nuevaHabitacion = { nombreTipo: '', capacidadPersonas: 2, numeroCamas: 1 };
    this.precioPorNoche  = 50;
    this.cantidadTotal   = 1;
  }
}