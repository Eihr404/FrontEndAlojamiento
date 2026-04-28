import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Nota: Aún no hemos creado AuthService, pero lo haremos en el siguiente paso
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    // Clonamos la petición para añadir el encabezado de forma inmutable
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};
