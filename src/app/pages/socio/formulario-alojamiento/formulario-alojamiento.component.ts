import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlojamientoService } from '../../../core/services/alojamiento.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdministradorService } from '../../../core/services/administrador.service'; // ← agregar
import { CrearAlojamientoRequest } from '../../../core/models/alojamiento.model';

@Component({
  selector: 'app-formulario-alojamiento',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="page-socio" style="max-width: 800px; margin: 0 auto;">
      <div class="page-header">
        <h2>Registrar Nuevo Alojamiento</h2>
        <a routerLink="/socio/mis-alojamientos" class="btn btn--outline">← Volver</a>
      </div>

      <div class="card-alojamiento" style="padding: 2rem;">
        <div *ngIf="error" class="alert alert--error">{{ error }}</div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          <div>
            <div class="form-group">
              <label>Nombre del Alojamiento *</label>
              <input type="text" [(ngModel)]="alojamiento.nombre" placeholder="Ej. Hotel Paraíso" />
            </div>

            <div class="form-group">
              <label>Tipo *</label>
              <select [(ngModel)]="alojamiento.tipo">
                <option value="Hotel">Hotel</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Casa">Casa</option>
                <option value="Hostal">Hostal</option>
              </select>
            </div>

            <div class="form-group">
              <label>Ciudad *</label>
                <select [(ngModel)]="alojamiento.ciudad">
                  <option value="Quito">Quito</option>
                  <option value="Guayaquil">Guayaquil</option>
                  <option value="Cuenca">Cuenca</option>
                  <option value="Ambato">Ambato</option>
                  <option value="Manta">Manta</option>
                  <option value="Loja">Loja</option>
                  <option value="Riobamba">Riobamba</option>
                  <option value="Esmeraldas">Esmeraldas</option>
                  <option value="Machala">Machala</option>
                  <option value="Ibarra">Ibarra</option>
                  <option value="Latacunga">Latacunga</option>
                  <option value="Salinas">Salinas</option>
                  <option value="Tena">Tena</option>
                  <option value="Puyo">Puyo</option>
                </select>
            </div>

            <div class="form-group">
              <label>Dirección *</label>
              <input type="text" [(ngModel)]="alojamiento.direccion" placeholder="Calle principal 123" />
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="alojamiento.descripcion" rows="3" placeholder="Describe tu propiedad..."></textarea>
            </div>
          </div>

          <div>
            <div style="display: flex; gap: 1rem;">
              <div class="form-group" style="flex: 1;">
                <label>Hora Check-In *</label>
                <input type="time" [(ngModel)]="checkInLocal" />
              </div>
              <div class="form-group" style="flex: 1;">
                <label>Hora Check-Out *</label>
                <input type="time" [(ngModel)]="checkOutLocal" />
              </div>
            </div>

            <div class="form-group">
              <label>Horas límite de cancelación *</label>
              <input type="number" [(ngModel)]="alojamiento.politicaCancelacionHoras" min="0" />
            </div>

            <h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Amenidades</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label><input type="checkbox" [(ngModel)]="alojamiento.tieneWifi" /> WiFi</label>
              <label><input type="checkbox" [(ngModel)]="alojamiento.tienePiscina" /> Piscina</label>
              <label><input type="checkbox" [(ngModel)]="alojamiento.admiteMascotas" /> Mascotas</label>
              <label><input type="checkbox" [(ngModel)]="alojamiento.tieneCocina" /> Cocina</label>
            </div>
          </div>
        </div>

        <div style="margin-top: 2rem; text-align: right;">
          <button class="btn btn--primary" (click)="guardar()" [disabled]="cargando">
            {{ cargando ? 'Guardando...' : 'Guardar Alojamiento' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class FormularioAlojamientoComponent {
  cargando = false;
  error = '';

  checkInLocal  = '15:00';
  checkOutLocal = '11:00';

  alojamiento: CrearAlojamientoRequest = {
    adminId: '',
    nombre: '',
    tipo: 'Hotel',
    descripcion: '',
    ciudad: '',
    direccion: '',
    checkIn: '',
    checkOut: '',
    politicaCancelacionHoras: 24,
    tieneWifi: false,
    tienePiscina: false,
    admiteMascotas: false,
    tieneCocina: false
  };

  constructor(
    private alojamientoService: AlojamientoService,
    private authService: AuthService,
    private administradorService: AdministradorService, // ← agregado
    private router: Router
  ) {}

  guardar() {
    this.error = '';

    if (!this.alojamiento.nombre || !this.alojamiento.ciudad || !this.alojamiento.direccion) {
      this.error = 'Por favor completa los campos obligatorios (*).';
      return;
    }

    this.cargando = true;

    const usuarioId = this.authService.currentUser()?.usuarioId;
    if (!usuarioId) {
      this.error = 'No se pudo identificar al usuario.';
      this.cargando = false;
      return;
    }

    // 1. Obtener adminId real
    this.administradorService.getByUsuarioId(usuarioId).subscribe({
      next: (res) => {
        this.alojamiento.adminId  = res.data.id;
        this.alojamiento.checkIn  = `${this.checkInLocal}:00`;
        this.alojamiento.checkOut = `${this.checkOutLocal}:00`;

        console.log('Payload enviado:', JSON.stringify(this.alojamiento));

        // 2. Crear alojamiento
        this.alojamientoService.crear(this.alojamiento).subscribe({
          next: () => {
            alert('Alojamiento creado con éxito');
            this.router.navigate(['/socio/mis-alojamientos']);
          },
          error: (err: any) => {
            this.error = err.error?.message || 'Error al guardar el alojamiento.';
            this.cargando = false;
          }
        });
      },
      error: () => {
        this.error = 'No se pudo obtener el perfil de administrador.';
        this.cargando = false;
      }
    });
  }
}