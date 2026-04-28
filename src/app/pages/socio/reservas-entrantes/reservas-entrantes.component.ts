import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdministradorService } from '../../../core/services/administrador.service';
import { Reserva } from '../../../core/models/reserva.model';

@Component({
  selector: 'app-reservas-entrantes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-socio">
      <div class="page-header">
        <h2>Reservas Recibidas</h2>
        <p style="color: var(--color-texto-suave);">Gestiona las solicitudes de tus clientes</p>
      </div>

      <div class="tabla-container" *ngIf="!cargando(); else loading">
        <table *ngIf="reservas().length > 0; else noReservas">
          <thead>
            <tr>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (r of reservas(); track r.id) {
              <tr>
                <td>{{ r.fechaCheckIn | date:'dd/MM/yyyy' }}</td>
                <td>{{ r.fechaCheckOut | date:'dd/MM/yyyy' }}</td>
                <td><strong>$ {{ r.montoTotal }}</strong></td>
                <td>
                  <span [ngClass]="['alert', 'alert--' + r.estado.toLowerCase()]"
                        style="padding: 0.2rem 0.5rem; font-size: 0.75rem; border-radius: 4px;">
                    {{ r.estado }}
                  </span>
                </td>
                <td>
                  <div style="display: flex; gap: 0.3rem;" *ngIf="r.estado === 'Pendiente'">
                    <button class="btn btn--sm"
                            (click)="actualizarEstado(r.id, 'Confirmada')">✓ Confirmar</button>
                    <button class="btn btn--sm btn--danger"
                            (click)="actualizarEstado(r.id, 'Cancelada')">✕ Cancelar</button>
                  </div>
                  <span *ngIf="r.estado !== 'Pendiente'"
                        style="color: gray; font-size: 0.8rem;">Sin acciones</span>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <ng-template #noReservas>
          <div style="padding: 3rem; text-align: center; color: gray;">
            <p>Aún no has recibido reservas para tus alojamientos.</p>
          </div>
        </ng-template>
      </div>

      <ng-template #loading>
        <div style="text-align: center; padding: 3rem;">
          <p>Cargando reservas... ⏳</p>
        </div>
      </ng-template>
    </div>
  `
})
export class ReservasEntrantesComponent implements OnInit {
  reservas = signal<Reserva[]>([]);
  cargando = signal(false);

  constructor(
    private reservaService:       ReservaService,
    private authService:          AuthService,
    private administradorService: AdministradorService
  ) {}

  ngOnInit() {
    this.cargarReservas();
  }

  cargarReservas() {
    this.cargando.set(true);
    const usuarioId = this.authService.currentUser()?.usuarioId;

    if (!usuarioId) {
      this.cargando.set(false);
      return;
    }

    this.administradorService.getByUsuarioId(usuarioId).subscribe({
      next: (res) => {
        const adminId = res.data.id;
        this.reservaService.getPorAdmin(adminId).subscribe({
          next: (r) => {
            this.reservas.set(r.data);
            this.cargando.set(false);
          },
          error: () => this.cargando.set(false)
        });
      },
      error: () => this.cargando.set(false)
    });
  }

  actualizarEstado(id: string, nuevoEstado: string) {
    if (!confirm(`¿Deseas marcar esta reserva como ${nuevoEstado}?`)) return;

    this.reservaService.cambiarEstado(id, nuevoEstado).subscribe({
      next: () => {
        this.reservas.update(list =>
          list.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r)
        );
      },
      error: (err: any) => alert('Error: ' + (err.error?.message || 'No se pudo cambiar el estado'))
    });
  }
}