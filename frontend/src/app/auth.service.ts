import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export const API_BASE = 'https://epigrafe.onrender.com/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('usuario') || 'null'));
  user$ = this.userSubject.asObservable();

  // HttpClient sin interceptores: evita una dependencia circular con authInterceptor.
  private http: HttpClient;

  constructor(httpBackend: HttpBackend) {
    this.http = new HttpClient(httpBackend);
  }

  updateUser(user: any) {
    this.userSubject.next(user);
  }

  /**
   * V6 — Cierra la sesión en el servidor (el token queda revocado aunque no haya
   * expirado) y después la borra del navegador. Si la API no responde, la sesión
   * local se borra igualmente y el token caduca solo a las 2 h.
   */
  async cerrarSesion(): Promise<void> {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await firstValueFrom(
          this.http.post(`${API_BASE}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } })
        );
      } catch {
        /* sin conexión o token ya inválido: se limpia igual */
      }
    }
    this.limpiarSesionLocal();
  }

  limpiarSesionLocal() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.userSubject.next(null);
  }
}
