import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlojamientoService } from '../../../core/services/alojamiento.service';
import { Alojamiento, AlojamientoFiltro } from '../../../core/models/alojamiento.model';

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="page-buscar">
      <h2>Busca tu alojamiento</h2>

      <!-- Filtros -->
      <div class="filtros-bar">

          <div class="form-group">
            <label>Ciudad</label>
            <select [(ngModel)]="filtro.ciudad">
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
            <label>Tipo de alojamiento</label>
            <select [(ngModel)]="filtro.tipo">
                  <option value="Hotel">Hotel</option>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Casa">Casa</option>
                  <option value="Hostal">Hostal</option>
            </select>
        </div>

        <label><input type="checkbox" [(ngModel)]="filtro.tieneWifi" /> WiFi</label>
        <label><input type="checkbox" [(ngModel)]="filtro.tienePiscina" /> Piscina</label>
        <label><input type="checkbox" [(ngModel)]="filtro.admiteMascotas" /> Mascotas</label>
        <label><input type="checkbox" [(ngModel)]="filtro.tieneCocina" /> Cocina</label>

        <button class="btn btn--primary" (click)="buscar()">Buscar</button>
        <button class="btn btn--outline" (click)="restaurar()">Restaurar</button>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando()" style="text-align:center; padding:3rem;">
        <p>Buscando... ⏳</p>
      </div>

      <!-- Sin resultados -->
      <div *ngIf="!cargando() && alojamientos().length === 0"
           style="text-align:center; padding:3rem;">
        <p>No se encontraron alojamientos con esos filtros.</p>
        <button class="btn btn--outline" (click)="restaurar()">Ver todos</button>
      </div>

      <!-- Resultados -->
      <div class="grid-alojamientos" *ngIf="!cargando() && alojamientos().length > 0">
        @for (a of alojamientos(); track a.id) {
          <div class="card-alojamiento">
            <div class="card-alojamiento__amenidades">
              @if (a.tieneWifi)      { <span title="WiFi">📶</span> }
              @if (a.tienePiscina)   { <span title="Piscina">🏊</span> }
              @if (a.admiteMascotas) { <span title="Mascotas">🐾</span> }
              @if (a.tieneCocina)    { <span title="Cocina">🍳</span> }
            </div>
            <h3>{{ a.nombre }}</h3>
            <p>{{ a.ciudad }} · {{ a.tipo }}</p>
            <div class="card-alojamiento__rating">⭐ {{ a.calificacionAvg | number:'1.1-1' }}</div>
            <a [routerLink]="['/cliente/alojamiento', a.id]" class="btn btn--outline">
              Ver detalles
            </a>
          </div>
        }
      </div>

      <!-- Paginación -->
      <div class="paginacion" *ngIf="totalPaginas > 1">
        <button [disabled]="filtro.pagina === 1" (click)="paginar(-1)">‹ Anterior</button>
        <span>Página {{ filtro.pagina }} de {{ totalPaginas }}</span>
        <button [disabled]="filtro.pagina === totalPaginas" (click)="paginar(1)">Siguiente ›</button>
      </div>
    </div>
  `
})
export class BuscarComponent implements OnInit {
  alojamientos = signal<Alojamiento[]>([]);
  cargando     = signal(false);
  totalPaginas = 1;

  filtro: AlojamientoFiltro = {
    pagina:            1,
    registrosPorPagina: 9
  };

  constructor(private alojamientoService: AlojamientoService) {}

  ngOnInit() { this.buscar(); }

  buscar() {
    this.filtro.pagina = 1;
    this.cargar();
  }

  restaurar() {
    this.filtro = { pagina: 1, registrosPorPagina: 9 };
    this.cargar();
  }

  paginar(dir: number) {
    this.filtro.pagina = (this.filtro.pagina ?? 1) + dir;
    this.cargar();
  }

  private cargar() {
    this.cargando.set(true);
    this.alojamientoService.getAll(this.filtro).subscribe({
      next: (res) => {
        this.alojamientos.set(res.data.items);
        const total    = res.data.totalRegistros;
        const porPagina = this.filtro.registrosPorPagina ?? 9;
        this.totalPaginas = Math.ceil(total / porPagina);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}