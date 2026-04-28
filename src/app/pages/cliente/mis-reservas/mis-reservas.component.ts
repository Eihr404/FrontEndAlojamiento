import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ResenaService } from '../../../core/services/resena.service';
import { Reserva } from '../../../core/models/reserva.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-reservas">
      <div class="page-header">
        <h2>Mis Reservas</h2>
      </div>

      <div class="tabla-container" *ngIf="!cargando(); else loading">
        <table *ngIf="reservas().length > 0; else noReservas">
          <thead>
            <tr>
              <th>ID Reserva</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Monto Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (r of reservas(); track r.id) {
              <tr>
                <td><small>{{ r.id | slice:0:8 }}...</small></td>
                <td>{{ r.fechaCheckIn | date:'dd/MM/yyyy' }}</td>
                <td>{{ r.fechaCheckOut | date:'dd/MM/yyyy' }}</td>
                <td><strong>$ {{ r.montoTotal }}</strong></td>
                <td>
                  <span [ngClass]="['badge', 'badge--' + r.estado.toLowerCase()]">
                    {{ r.estado }}
                  </span>
                </td>
                <td>
                  <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">

                    <!-- Cancelar -->
                    <button
                      *ngIf="r.estado === 'Pendiente' || r.estado === 'Confirmada'"
                      class="btn btn--sm btn--danger"
                      (click)="cancelarReserva(r.id)">
                      Cancelar
                    </button>

                    <!-- Dejar reseña: elegible y aún no reseñó -->
                    <button
                      *ngIf="esElegibleParaResena(r) && !resenasEnviadas().has(r.alojamientoId)"
                      class="btn btn--sm"
                      (click)="abrirModalResena(r)">
                      ⭐ Dejar reseña
                    </button>

                    <!-- Ya reseñó -->
                    <span
                      *ngIf="esElegibleParaResena(r) && resenasEnviadas().has(r.alojamientoId)"
                      style="color:green; font-size:0.85rem; align-self:center;">
                      ✓ Reseña enviada
                    </span>

                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <ng-template #noReservas>
          <div style="padding:2rem; text-align:center;">
            <p>Aún no has realizado ninguna reserva.</p>
          </div>
        </ng-template>
      </div>

      <ng-template #loading>
        <div style="text-align:center; padding:3rem;">
          <p>Cargando tus reservas... ⏳</p>
        </div>
      </ng-template>
    </div>

    <!-- Modal Reseña -->
    <div *ngIf="modalResena()" class="modal-overlay" (click)="cerrarModal()">
      <div class="modal-content" (click)="$event.stopPropagation()"
           style="max-width:460px;">
        <h3>Dejar reseña</h3>
        <p style="color:var(--color-texto-suave); margin-bottom:1.5rem;">
          Comparte tu experiencia con este alojamiento
        </p>

        <div *ngIf="errorModal()" class="alert alert--error">{{ errorModal() }}</div>

        <div class="form-group">
          <label>Calificación *</label>
          <div class="estrellas-selector">
            @for (n of [1,2,3,4,5]; track n) {
              <span class="estrella"
                    [class.activa]="n <= (estrellasHover() || estrellas())"
                    (click)="estrellas.set(n)"
                    (mouseover)="estrellasHover.set(n)"
                    (mouseleave)="estrellasHover.set(0)">
                {{ n <= (estrellasHover() || estrellas()) ? '★' : '☆' }}
              </span>
            }
          </div>
        </div>

        <div class="form-group">
          <label>Comentario (opcional)</label>
          <textarea [(ngModel)]="comentario" rows="4"
                    placeholder="¿Cómo fue tu experiencia?"></textarea>
        </div>

        <div style="display:flex; gap:1rem; margin-top:1.5rem;">
          <button class="btn btn--outline" (click)="cerrarModal()" style="flex:1;">
            Cancelar
          </button>
          <button class="btn btn--primary" (click)="enviarResena()"
                  [disabled]="estrellas() === 0 || enviandoResena()"
                  style="flex:1;">
            {{ enviandoResena() ? 'Enviando...' : 'Publicar reseña' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .badge--pendiente   { background: #fff3cd; color: #856404; }
    .badge--confirmada  { background: #d1e7dd; color: #0a3622; }
    .badge--cancelada   { background: #f8d7da; color: #58151c; }
    .badge--completada  { background: #cfe2ff; color: #052c65; }

    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .estrellas-selector { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .estrella {
      font-size: 2rem; cursor: pointer;
      color: #ccc; transition: color 0.15s; user-select: none;
    }
    .estrella.activa, .estrella:hover { color: #f5a623; }
  `]
})
export class MisReservasComponent implements OnInit {
  reservas        = signal<Reserva[]>([]);
  cargando        = signal(false);
  // Set que persiste en el componente: alojamientoId de los ya reseñados
  resenasEnviadas = signal<Set<string>>(new Set());

  // Modal
  modalResena    = signal(false);
  estrellas      = signal(0);
  estrellasHover = signal(0);
  comentario     = '';
  errorModal     = signal('');
  enviandoResena = signal(false);

  private reservaActual: Reserva | null = null;
  private clienteId = '';

  constructor(
    private reservaService: ReservaService,
    private authService:    AuthService,
    private clienteService: ClienteService,
    private resenaService:  ResenaService
  ) {}

  ngOnInit() { this.cargarReservas(); }

  // Helper: reserva elegible para reseña
  esElegibleParaResena(r: Reserva): boolean {
    return r.estado === 'Confirmada' || r.estado === 'Completada';
  }

  cargarReservas() {
    this.cargando.set(true);
    const usuarioId = this.authService.getUserIdFromToken();
    if (!usuarioId) { this.cargando.set(false); return; }

    this.clienteService.getByUsuarioId(usuarioId).subscribe({
      next: clienteRes => {
        this.clienteId = clienteRes.data.id;

        this.reservaService.getPorCliente(this.clienteId).subscribe({
          next: res => {
            const reservas = res.data;
            this.reservas.set(reservas);

            // Para cada reserva elegible, verificar en el backend
            // si ya existe una reseña de este cliente en ese alojamiento
            const elegibles = reservas.filter(r => this.esElegibleParaResena(r));

            if (elegibles.length === 0) {
              this.cargando.set(false);
              return;
            }

            // Eliminar alojamientos duplicados para no hacer llamadas repetidas
            const alojamientosUnicos = [...new Set(elegibles.map(r => r.alojamientoId))];

            const verificaciones = alojamientosUnicos.map(alojamientoId =>
              this.resenaService.getPorAlojamiento(alojamientoId).pipe(
                map(resRes => {
                  // Buscar si alguna reseña pertenece a este cliente
                  const yaReseno = resRes.data.some(
                    resena => resena.clienteId === this.clienteId
                  );
                  return { alojamientoId, yaReseno };
                }),
                catchError(() => of({ alojamientoId, yaReseno: false }))
              )
            );

            forkJoin(verificaciones).subscribe({
              next: resultados => {
                const yaResenados = new Set(
                  resultados
                    .filter(r => r.yaReseno)
                    .map(r => r.alojamientoId)
                );
                this.resenasEnviadas.set(yaResenados);
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

  cancelarReserva(id: string) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
    this.reservaService.cancelar(id).subscribe({
      next: () => this.reservas.update(list =>
        list.map(r => r.id === id ? { ...r, estado: 'Cancelada' } : r)
      ),
      error: (err: any) => alert('No se pudo cancelar: ' + (err.error?.message ?? 'Error'))
    });
  }

  abrirModalResena(reserva: Reserva) {
    this.reservaActual = reserva;
    this.estrellas.set(0);
    this.estrellasHover.set(0);
    this.comentario = '';
    this.errorModal.set('');
    this.modalResena.set(true);
  }

  cerrarModal() {
    this.modalResena.set(false);
    this.reservaActual = null;
  }

  enviarResena() {
    if (this.estrellas() === 0) {
      this.errorModal.set('Selecciona una calificación.');
      return;
    }

    this.enviandoResena.set(true);
    this.errorModal.set('');

    this.resenaService.crear({
      clienteId:     this.clienteId,
      alojamientoId: this.reservaActual!.alojamientoId,
      estrellas:     this.estrellas(),
      comentario:    this.comentario || undefined
    }).subscribe({
      next: () => {
        // Marcar como reseñado en el signal local
        this.resenasEnviadas.update(set => {
          const nuevo = new Set(set);
          nuevo.add(this.reservaActual!.alojamientoId);
          return nuevo;
        });
        this.enviandoResena.set(false);
        this.cerrarModal();
      },
      error: (err: any) => {
        this.errorModal.set(err.error?.message ?? 'Error al enviar la reseña.');
        this.enviandoResena.set(false);
      }
    });
  }
}