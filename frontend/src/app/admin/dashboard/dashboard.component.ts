import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../services/toast.service';

interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  habilitado: boolean;
  creado_en: string;
  ultimo_login: string | null;
  requiere_cambio_password: boolean;
  rol: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class Dashboard implements OnInit {
  // Signals en vez de propiedades normales: en una app zoneless (sin Zone.js,
  // como esta), Angular solo vuelve a renderizar la vista cuando detecta que
  // un signal cambió. Si usáramos "this.cargando = false" después de un
  // await, el cambio ocurre fuera de cualquier evento que Angular esté
  // observando, y la vista nunca se actualiza aunque el dato ya sea correcto
  // — que es exactamente lo que estaba pasando.
  usuarios = signal<UsuarioAdmin[]>([]);
  cargando = signal(true);
  error = signal('');
  procesandoId = signal<number | null>(null);

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  private headers() {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  }

  async cargarUsuarios() {
    this.cargando.set(true);
    this.error.set('');
    try {
      const datos = await firstValueFrom(
        this.http.get<UsuarioAdmin[]>('https://epigrafe.onrender.com/api/admin/usuarios', {
          headers: this.headers(),
        })
      );
      this.usuarios.set(datos);
    } catch (err: any) {
      this.error.set(err?.error?.error || 'No se pudo cargar la lista de usuarios.');
    } finally {
      this.cargando.set(false);
    }
  }

  async toggleHabilitado(usuario: UsuarioAdmin) {
    const nuevoEstado = !usuario.habilitado;
    const confirmacion = nuevoEstado
      ? `¿Habilitar la cuenta de ${usuario.nombre}?`
      : `¿Deshabilitar la cuenta de ${usuario.nombre}? No podrá iniciar sesión hasta que la vuelvas a habilitar.`;

    if (!confirm(confirmacion)) return;

    this.procesandoId.set(usuario.id);
    try {
      await firstValueFrom(
        this.http.patch(
          `https://epigrafe.onrender.com/api/admin/usuarios/${usuario.id}/estado`,
          { habilitado: nuevoEstado },
          { headers: this.headers() }
        )
      );
      // Actualizamos el signal creando un arreglo nuevo (inmutabilidad),
      // así Angular detecta el cambio de forma confiable.
      this.usuarios.update((lista) =>
        lista.map((u) => (u.id === usuario.id ? { ...u, habilitado: nuevoEstado } : u))
      );
      this.toast.exito(nuevoEstado ? `Cuenta de ${usuario.nombre} habilitada.` : `Cuenta de ${usuario.nombre} deshabilitada.`);
    } catch (err: any) {
      this.toast.error(err?.error?.error || 'No se pudo actualizar el estado de la cuenta.');
    } finally {
      this.procesandoId.set(null);
    }
  }

  async toggleRequiereCambioPassword(usuario: UsuarioAdmin) {
    const nuevoValor = !usuario.requiere_cambio_password;
    this.procesandoId.set(usuario.id);
    try {
      await firstValueFrom(
        this.http.patch(
          `https://epigrafe.onrender.com/api/admin/usuarios/${usuario.id}/requiere-cambio-password`,
          { requiereCambioPassword: nuevoValor },
          { headers: this.headers() }
        )
      );
      this.usuarios.update((lista) =>
        lista.map((u) => (u.id === usuario.id ? { ...u, requiere_cambio_password: nuevoValor } : u))
      );
    } catch (err: any) {
      this.toast.error(err?.error?.error || 'No se pudo actualizar el usuario.');
    } finally {
      this.procesandoId.set(null);
    }
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}