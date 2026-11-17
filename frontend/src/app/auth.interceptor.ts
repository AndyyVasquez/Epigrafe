import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService, API_BASE } from './auth.service';

/**
 * Adjunta el token de sesión a todas las peticiones a la API de Epígrafe
 * (V1: ahora GET /api/pedidos también lo exige).
 * Si la API responde 401 a una petición que llevaba token, la sesión ya no es
 * válida en el servidor (expiró o se cerró, V6): se limpia también en el navegador.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = localStorage.getItem('token');
  const esApi = req.url.startsWith(API_BASE);
  const esLogin = req.url.startsWith(`${API_BASE}/auth/login`);
  const conToken = esApi && !esLogin && !!token && !req.headers.has('Authorization');

  const peticion = conToken ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      if (conToken && err.status === 401) auth.limpiarSesionLocal();
      return throwError(() => err);
    })
  );
};
