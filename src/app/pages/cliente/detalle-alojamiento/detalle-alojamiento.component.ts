import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { AlojamientoService } from '../../../core/services/alojamiento.service';
import { HabitacionService } from '../../../core/services/habitacion.service';
import { AlojamientoHabitacionService } from '../../../core/services/alojamiento-habitacion.service';
import { Alojamiento } from '../../../core/models/alojamiento.model';

@Component({
  selector: 'app-detalle-alojamiento',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-detalle" *ngIf="alojamiento(); else loading">

      <a routerLink="/cliente/buscar" class="btn btn--outline" style="margin-bottom: 1.5rem;">
        ← Volver a buscar
      </a>

      <h2>{{ alojamiento()?.nombre }}</h2>
      <p style="color: var(--color-texto-suave); margin-bottom: 2rem;">
        📍 {{ alojamiento()?.ciudad }} · {{ alojamiento()?.direccion }}
      </p>

      <div style="display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 3rem;">
        <div class="card-alojamiento" style="flex: 2; min-width: 300px;">
          <h3>Descripción</h3>
          <p style="margin-top: 1rem;">{{ alojamiento()?.descripcion || 'Sin descripción disponible.' }}</p>

          <h4 style="margin-top: 1.5rem;">Amenidades</h4>
          <div class="card-alojamiento__amenidades" style="margin-top: 0.5rem;">
            <span *ngIf="alojamiento()?.tieneWifi">📶 WiFi</span>
            <span *ngIf="alojamiento()?.tienePiscina">🏊 Piscina</span>
            <span *ngIf="alojamiento()?.admiteMascotas">🐾 Admite Mascotas</span>
            <span *ngIf="alojamiento()?.tieneCocina">🍳 Cocina</span>
          </div>
        </div>

        <div class="card-alojamiento" style="flex: 1; min-width: 250px;">
          <h3>Reglas del alojamiento</h3>
          <ul style="margin-top: 1rem; line-height: 1.8; padding-left: 1rem;">
            <li><strong>Check-In:</strong> {{ alojamiento()?.checkIn }}</li>
            <li><strong>Check-Out:</strong> {{ alojamiento()?.checkOut }}</li>
            <li><strong>Cancelación gratuita:</strong> Hasta {{ alojamiento()?.politicaCancelacionHoras }}h antes.</li>
          </ul>
        </div>
      </div>

      <h3>Habitaciones Disponibles</h3>
      <div class="grid-alojamientos">
        @for (hab of habitaciones(); track hab.id) {
          <div class="card-alojamiento">
            <h4>{{ hab.nombreTipo }}</h4>
            <div style="margin: 1rem 0;">
              <p>👤 Capacidad: {{ hab.capacidadPersonas }} personas</p>
              <p>🛏️ Camas: {{ hab.numeroCamas }}</p>
              <p class="card-alojamiento__rating" style="font-size: 1.2rem; margin-top: 0.5rem;">
                $ {{ hab.precioNoche }} / noche
              </p>
              <p style="font-size: 0.85rem; color: var(--color-texto-suave);">
                {{ hab.cantidadTotal }} disponible(s)
              </p>
            </div>

            <button class="btn btn--primary"
                    [disabled]="hab.cantidadTotal <= 0"
                    (click)="reservar(hab)"
                    style="width: 100%;">
              {{ hab.cantidadTotal > 0 ? 'Reservar' : 'No disponible' }}
            </button>
          </div>
        }

        @if (habitaciones().length === 0) {
          <p>No hay habitaciones registradas para este alojamiento.</p>
        }
      </div>
    </div>

    <ng-template #loading>
      <div style="text-align: center; padding: 3rem;">
        <h2>Cargando detalles... ⏳</h2>
      </div>
    </ng-template>
  `
})
export class DetalleAlojamientoComponent implements OnInit {
  alojamiento  = signal<Alojamiento | null>(null);
  habitaciones = signal<any[]>([]);

  constructor(
    private route:                      ActivatedRoute,
    private router:                       Router,     
    private alojamientoService:         AlojamientoService,
    private habitacionService:          HabitacionService,
    private alojamientoHabitacionService: AlojamientoHabitacionService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarAlojamiento(id);
      this.cargarHabitaciones(id);
    }
  }

  private cargarAlojamiento(id: string) {
    this.alojamientoService.getById(id).subscribe({
      next: (res) => this.alojamiento.set(res.data),
      error: (err) => console.error('Error cargando alojamiento', err)
    });
  }

  reservar(hab: any) {
  console.log('=== Navegando a reservar ===');
  console.log('alojamientoId:', this.alojamiento()?.id);
  console.log('hab:', hab);
  this.router.navigate(
    ['/cliente/reservar'],
    {
      queryParams: {
        alojamientoId:  this.alojamiento()?.id,
        alojamientoNom: this.alojamiento()?.nombre,
        ciudad:         this.alojamiento()?.ciudad,
        relacionId:     hab.id,
        habitacionId:   hab.habitacionId,
        nombreTipo:     hab.nombreTipo,
        capacidad:      hab.capacidadPersonas,
        numeroCamas:    hab.numeroCamas,
        precioNoche:    hab.precioNoche
        }
      }
    );
  }


  private cargarHabitaciones(id: string) {
    this.alojamientoHabitacionService.getPorAlojamiento(id).subscribe({
      next: (res) => {
        const relaciones = res.data;

        if (relaciones.length === 0) {
          this.habitaciones.set([]);
          return;
        }

        const requests = relaciones.map((rel: any) =>
          this.habitacionService.getById(rel.habitacionId).pipe(
            map(h => ({
              id:                rel.id,              // ← ID de alojamiento_habitacion
              habitacionId:      rel.habitacionId,    // ← AÑADIR ESTE CAMPO si no lo tenías
              nombreTipo:        h.data.nombreTipo,
              capacidadPersonas: h.data.capacidadPersonas,
              numeroCamas:       h.data.numeroCamas,
              precioNoche:       rel.precioNoche,
              cantidadTotal:     rel.cantidadTotal
            }))
          )
        );

        forkJoin(requests).subscribe({
          next:  (items) => this.habitaciones.set(items as any[]),
          error: (err)   => console.error('Error enriqueciendo habitaciones', err)
        });
      },
      error: (err) => console.error('Error cargando habitaciones', err)
    });
  }
}