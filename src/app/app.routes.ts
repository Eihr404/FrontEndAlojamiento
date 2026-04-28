import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  // Ruta raíz → redirige según estado
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Rutas públicas
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: 'login',
        canActivate: [noAuthGuard],
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'registro',
        canActivate: [noAuthGuard],
        loadComponent: () =>
          import('./pages/auth/registro/registro.component').then(m => m.RegistroComponent)
      },
      { 
        path: 'registro-socio', 
        loadComponent: () => import('./pages/auth/registro/registro-socio.component')
          .then(m => m.RegistroSocioComponent) // <--- Asegúrate que este nombre sea exacto
      }
    ]
  },

// Portal Cliente
{
  path: 'cliente',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./layouts/cliente/cliente-layout.component').then(m => m.ClienteLayoutComponent),
  children: [
    { path: '', redirectTo: 'buscar', pathMatch: 'full' },
    {
      path: 'buscar',
      loadComponent: () =>
        import('./pages/cliente/buscar/buscar.component').then(m => m.BuscarComponent)
    },
    {
      path: 'alojamiento/:id',
      loadComponent: () =>
        import('./pages/cliente/detalle-alojamiento/detalle-alojamiento.component')
          .then(m => m.DetalleAlojamientoComponent)
    },
    {
      path: 'reservar',  // ← mover aquí dentro
      loadComponent: () =>
        import('./pages/cliente/reservar/reservar.component')
          .then(m => m.ReservarComponent)
    },
    {
      path: 'mis-reservas',
      loadComponent: () =>
        import('./pages/cliente/mis-reservas/mis-reservas.component')
          .then(m => m.MisReservasComponent)
    },
    {
      path: 'perfil',
      loadComponent: () =>
        import('./pages/cliente/perfil/perfil.component').then(m => m.PerfilClienteComponent)
    }
  ]
},


  // Portal Socio (Administrador)
  {
    path: 'socio',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./layouts/socio/socio-layout.component').then(m => m.SocioLayoutComponent),
    children: [
      { path: '', redirectTo: 'mis-alojamientos', pathMatch: 'full' },
      {
        path: 'mis-alojamientos',
        loadComponent: () =>
          import('./pages/socio/mis-alojamientos/mis-alojamientos.component')
            .then(m => m.MisAlojamientosComponent)
      },
      {
        path: 'alojamiento/nuevo',
        loadComponent: () =>
          import('./pages/socio/formulario-alojamiento/formulario-alojamiento.component')
            .then(m => m.FormularioAlojamientoComponent)
      },
      
      {
        path: 'alojamiento/:id/habitaciones',
        loadComponent: () =>
          import('./pages/socio/habitaciones/habitaciones.component')
            .then(m => m.HabitacionesComponent)
      },
      {
        path: 'reservas-entrantes',
        loadComponent: () =>
          import('./pages/socio/reservas-entrantes/reservas-entrantes.component')
            .then(m => m.ReservasEntrantesComponent)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/socio/perfil/perfil.component')
            .then(m => m.PerfilSocioComponent)
      },
      {
        path: 'resenas',
        loadComponent: () =>
          import('./pages/socio/resenas/resenas-socio.component')
            .then(m => m.ResenasSocioComponent)
      }
    ]
  },

  // Wildcard
  { path: '**', redirectTo: 'login' }
];