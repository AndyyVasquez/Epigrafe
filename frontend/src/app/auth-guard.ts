import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastService } from './services/toast.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const token = localStorage.getItem('token');
  const usuarioInfo = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Si no hay sesión iniciada, redirige al login
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Comprobar roles permitidos en la ruta
  const rolesEsperados = route.data['roles'] as Array<string>;
  if (rolesEsperados && !rolesEsperados.includes(usuarioInfo.rol)) {
    toast.error('No tienes permisos para acceder a este módulo.');
    router.navigate(['/']); // Redirige a la página principal
    return false;
  }

  return true;
};