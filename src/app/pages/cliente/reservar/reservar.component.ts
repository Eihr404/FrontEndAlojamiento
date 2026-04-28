import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { FacturaService } from '../../../core/services/factura.service';
import { MetodoPagoService } from '../../../core/services/metodo-pago.service';
import { ReservaService } from '../../../core/services/reserva.service';

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DecimalPipe],
  template: `
    <div class="page-reservar">
      <a [routerLink]="['/cliente/alojamiento', alojamientoId]" class="btn btn--outline back-btn">
        <- Volver al alojamiento
      </a>

      <h2 class="page-title">Confirmar Reserva</h2>

      @if (error()) {
        <div class="alert alert--error">{{ error() }}</div>
      }

      <div class="reservar-grid">
        <div class="resumen-card">
          <h3>Resumen</h3>
          <hr />

          <div class="resumen-item">
            <span class="resumen-label">Alojamiento</span>
            <span class="resumen-valor">{{ alojamientoNombre }}</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-label">Ciudad</span>
            <span class="resumen-valor">{{ ciudad }}</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-label">Tipo de habitacion</span>
            <span class="resumen-valor">{{ nombreTipo }}</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-label">Capacidad</span>
            <span class="resumen-valor">{{ capacidad }} personas - {{ numeroCamas }} cama(s)</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-valor precio">$ {{ precioNoche() }}</span>
            <span>{{ cantidadNoches() }} noche(s) x $ {{ precioNoche() }}</span>
          </div>

          <hr />

          <div class="resumen-item">
            <span class="resumen-label">Check-In</span>
            <span class="resumen-valor">{{ fechaCheckIn() || '-' }}</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-label">Check-Out</span>
            <span class="resumen-valor">{{ fechaCheckOut() || '-' }}</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-label">Noches</span>
            <span class="resumen-valor">{{ cantidadNoches() }}</span>
          </div>

          <hr />

          <div class="resumen-item resumen-total">
            <span class="resumen-label">TOTAL</span>
            <span class="resumen-valor precio-total">
              $ {{ montoTotal() | number:'1.2-2' }}
            </span>
          </div>
        </div>

        <div class="form-card">
          <h3>Datos de la reserva</h3>

          <div class="form-group">
            <label>Fecha de Check-In</label>
            <input type="date" [ngModel]="fechaCheckIn()"
              (ngModelChange)="fechaCheckIn.set($event); validarFechas()"
              [min]="hoy" 
            />

          </div>

          <div class="form-group">
            <label>Fecha de Check-Out</label>
            <input type="date" [ngModel]="fechaCheckOut()"
              (ngModelChange)="fechaCheckOut.set($event); validarFechas()"
              [min]="minCheckOut()" 
            />
          </div>

          @if (errorFechas()) {
            <div class="alert alert--error">{{ errorFechas() }}</div>
          }

          <div class="form-group">
            <label>Metodo de pago</label>
            @if (cargandoPagos()) {
              <p style="color:var(--color-texto-suave);font-size:0.9rem;">Cargando metodos...</p>
            } @else {
            <select [ngModel]="metodoPagoId()" (ngModelChange)="metodoPagoId.set($event)">
              <option value="">Selecciona un metodo...</option>
              @for (m of metodosPago(); track m.id) {
                <option [value]="m.id">{{ m.nombre }}</option>
              }
            </select>
            }
          </div>

          <div class="form-group">
            <label>Notas adicionales (opcional)</label>
            <textarea
              [(ngModel)]="notas"
              rows="3"
              placeholder="Indicaciones especiales, llegada tardia, etc."
            ></textarea>
          </div>

          @if (cantidadNoches() > 0) {
            <div class="monto-banner">
              <span>{{ cantidadNoches() }} noche(s) x $ {{ precioNoche() }}</span>
              <strong>= $ {{ montoTotal() | number:'1.2-2' }}</strong>
            </div>
          }

          <button
            class="btn btn--primary btn--full"
            (click)="confirmarReserva()"
            [disabled]="!formularioValido() || enviando()"
          >
            @if (enviando()) {
              Procesando...
            } @else {
              Confirmar Reserva
            }
          </button>
        </div>
      </div>

      @if (reservaExitosa()) {
        <div class="modal-overlay">
          <div class="modal-success">
            <div class="modal-success__icon">*</div>
            <h3>Reserva confirmada</h3>
            <p>Tu reserva fue creada exitosamente.</p>
            @if (numeroFactura()) {
              <p class="factura-num">
                Factura Ndeg: <strong>{{ numeroFactura() }}</strong>
              </p>
            }
            <div class="modal-success__acciones">
              <button class="btn btn--primary" (click)="irAMisReservas()">
                Ver mis reservas
              </button>
              <a routerLink="/cliente/buscar" class="btn btn--outline">
                Seguir explorando
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-reservar { max-width: 1000px; margin: 0 auto; }
    .back-btn { margin-bottom: 1.5rem; display: inline-flex; }
    .page-title { font-family: var(--fuente-titulo); font-size: 2rem; margin-bottom: 2rem; }

    .reservar-grid {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 700px) {
      .reservar-grid { grid-template-columns: 1fr; }
    }

    .resumen-card {
      background: white;
      border-radius: var(--radio);
      box-shadow: var(--sombra);
      padding: 1.8rem;
      position: sticky;
      top: 1.5rem;
    }

    .resumen-card h3 { font-family: var(--fuente-titulo); margin-bottom: 1rem; }
    .resumen-card hr { border: none; border-top: 1px solid var(--color-borde); margin: 1rem 0; }

    .resumen-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 0.4rem 0;
      gap: 1rem;
    }

    .resumen-label { color: var(--color-texto-suave); font-size: 0.9rem; }
    .resumen-valor { font-weight: 600; text-align: right; }
    .precio { color: var(--color-acento); }
    .resumen-total .resumen-label { font-weight: 700; font-size: 1rem; color: var(--color-texto); }
    .precio-total { font-size: 1.5rem; color: var(--color-acento); }

    .form-card {
      background: white;
      border-radius: var(--radio);
      box-shadow: var(--sombra);
      padding: 1.8rem;
    }

    .form-card h3 { font-family: var(--fuente-titulo); margin-bottom: 1.5rem; }

    .monto-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff8f5;
      border: 1.5px solid var(--color-acento);
      border-radius: var(--radio);
      padding: 0.75rem 1rem;
      margin-bottom: 1.2rem;
      font-size: 0.95rem;
    }

    .monto-banner strong { color: var(--color-acento); font-size: 1.1rem; }
    .btn--full { width: 100%; justify-content: center; padding: 1rem; font-size: 1rem; }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }

    .modal-success {
      background: white;
      border-radius: var(--radio);
      padding: 3rem;
      max-width: 420px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }

    .modal-success__icon { font-size: 3.5rem; margin-bottom: 1rem; }
    .modal-success h3 { font-family: var(--fuente-titulo); font-size: 1.6rem; margin-bottom: 0.5rem; }
    .modal-success p { color: var(--color-texto-suave); margin-bottom: 0.5rem; }

    .modal-success__acciones {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      margin-top: 1.5rem;
    }

    .factura-num { font-size: 0.9rem; color: var(--color-primario); }
  `]
})
export class ReservarComponent implements OnInit {
  alojamientoId = '';
  alojamientoNombre = '';
  ciudad = '';
  relacionId = '';
  habitacionId = '';
  nombreTipo = '';
  capacidad = 0;
  numeroCamas = 0;
  precioNoche = signal(0);

  fechaCheckIn = signal('');
  fechaCheckOut = signal('');
  metodoPagoId = signal('');
  notas = '';
  errorFechas = signal('');
  hoy = new Date().toISOString().split('T')[0];

  metodosPago = signal<any[]>([]);
  cargandoPagos = signal(true);
  enviando = signal(false);
  reservaExitosa = signal(false);
  numeroFactura = signal('');
  error = signal('');

  cantidadNoches = computed(() => {
  if (!this.fechaCheckIn() || !this.fechaCheckOut()) return 0;
  const diff = new Date(this.fechaCheckOut()).getTime() - new Date(this.fechaCheckIn()).getTime();
  const noches = Math.ceil(diff / 86_400_000);
  return noches > 0 ? noches : 0;
});

montoTotal = computed(() => this.cantidadNoches() * this.precioNoche());

minCheckOut = computed(() => {
  if (!this.fechaCheckIn()) return this.hoy;
  const fecha = new Date(this.fechaCheckIn());
  fecha.setDate(fecha.getDate() + 1);
  return fecha.toISOString().split('T')[0];
});

formularioValido = computed(() =>
  !!this.fechaCheckIn() &&
  !!this.fechaCheckOut() &&
  !!this.metodoPagoId() &&
  this.cantidadNoches() > 0 &&
  !this.errorFechas()
);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private clienteService: ClienteService,
    private reservaService: ReservaService,
    private facturaService: FacturaService,
    private metodoPagoService: MetodoPagoService
  ) {}

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap;
    this.alojamientoId = q.get('alojamientoId') ?? '';
    this.alojamientoNombre = q.get('alojamientoNom') ?? '';
    this.ciudad = q.get('ciudad') ?? '';
    this.relacionId = q.get('relacionId') ?? '';
    this.habitacionId = q.get('habitacionId') ?? ''; // ← agregar
    this.nombreTipo = q.get('nombreTipo') ?? '';
    this.capacidad = Number(q.get('capacidad') ?? 0);
    this.numeroCamas = Number(q.get('numeroCamas') ?? 0);
    this.precioNoche.set(Number(q.get('precioNoche') ?? 0));

    if (!this.alojamientoId || !this.precioNoche()) {
      this.error.set('Datos incompletos. Vuelve y selecciona una habitacion.');
    }

    this.metodoPagoService.getAll().subscribe({
      next: (res) => {
        this.metodosPago.set(res.data);
        this.cargandoPagos.set(false);
      },
      error: () => this.cargandoPagos.set(false)
    });
  }

  validarFechas() {
      this.errorFechas.set('');
      if (!this.fechaCheckIn() || !this.fechaCheckOut()) return;
      if (new Date(this.fechaCheckOut()) <= new Date(this.fechaCheckIn())) {
        this.errorFechas.set('El Check-Out debe ser posterior al Check-In.');
      }
    }

    confirmarReserva() {
    if (!this.formularioValido()) return;
    this.enviando.set(true);
    this.error.set('');

    const usuarioId = this.authService.getUserIdFromToken();
    if (!usuarioId) {
      this.error.set('Sesion invalida. Inicia sesion nuevamente.');
      this.enviando.set(false);
      return;
    }

    this.clienteService.getByUsuarioId(usuarioId).subscribe({
      next: (clienteRes) => {
        this.reservaService.crear({
          clienteId:     clienteRes.data.id,
          alojamientoId: this.alojamientoId,
          habitacionId:  this.habitacionId, // ← usar habitacionId, no relacionId
          fechaCheckIn:  this.fechaCheckIn() + 'T00:00:00Z',  // ← corregido
          fechaCheckOut: this.fechaCheckOut() + 'T00:00:00Z', // ← corregido
          montoTotal:    this.montoTotal()
        }).subscribe({          
          next: (reservaRes) => {
            this.facturaService.crear({
              reservaId:    reservaRes.data.id,
              metodoPagoId: this.metodoPagoId()  // ← signal
            }).subscribe({
              next: (fRes) => {
                this.numeroFactura.set(fRes.data.numFactura ?? '');
                this.reservaExitosa.set(true);
                this.enviando.set(false);
              },
              error: () => {
                this.reservaExitosa.set(true);
                this.enviando.set(false);
              }
            });
          },
          error: (err) => {
            this.error.set(err?.error?.message ?? 'Error al crear la reserva.');
            this.enviando.set(false);
          }
        });
      },
      error: () => {
        this.error.set('No se encontro tu perfil de cliente.');
        this.enviando.set(false);
      }
    });
  }

  irAMisReservas() {
    this.router.navigate(['/cliente/mis-reservas']);
  }
}
