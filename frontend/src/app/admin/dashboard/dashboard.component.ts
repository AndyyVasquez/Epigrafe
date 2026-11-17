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

// Interfaz para los pedidos de Pickup
interface PedidoPickup {
  id: number;
  nombre_cliente: string;
  correo_cliente: string;
  telefono_cliente: string;
  total: number;
  estado: string;
  creado_en: string;
}

interface RelojVinculado {
  jti: string;
  descripcion: string | null;
  creada_en: string;
  expira_en: string;
  nombre: string;
  correo: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class Dashboard implements OnInit {
  usuarios = signal<UsuarioAdmin[]>([]);
  cargando = signal(true);
  error = signal('');
  procesandoId = signal<number | null>(null);

  // NUEVOS SIGNALS PARA GESTIÓN DE PEDIDOS EN EL DASHBOARD
  pedidos = signal<PedidoPickup[]>([]);
  cargandoPedidos = signal(false);

  // V2 — Relojes Wear OS vinculados a una cuenta del personal
  relojes = signal<RelojVinculado[]>([]);
  codigoReloj = signal('');
  vinculandoReloj = signal(false);

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarPedidos();
    this.cargarRelojes();

    // Polling cada 10 segundos para actualizar pedidos en tiempo real en el panel de admin
    setInterval(() => {
      this.cargarPedidos();
    }, 10000);
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

  // NUEVO: Cargar pedidos desde Render
  async cargarPedidos() {
    try {
      const datos = await firstValueFrom(
        this.http.get<PedidoPickup[]>('https://epigrafe.onrender.com/api/pedidos')
      );
      this.pedidos.set(datos);
    } catch (err: any) {
      console.error('Error al cargar pedidos:', err);
    }
  }

  // NUEVO: Cambiar estatus de pedido y sincronizar con el reloj Wear OS
  async actualizarEstadoPedido(pedidoId: number, event: any) {
    const nuevoEstado = event.target.value;
    try {
      await firstValueFrom(
        this.http.patch(`https://epigrafe.onrender.com/api/pedidos/${pedidoId}/estado`, {
          estado: nuevoEstado,
        })
      );

      // Actualizamos el signal localmente de forma reactiva
      this.pedidos.update((lista) =>
        lista.map((p) => (p.id === pedidoId ? { ...p, estado: nuevoEstado } : p))
      );

      this.toast.info(`Estado del pedido #${pedidoId} actualizado a: ${nuevoEstado}`);
    } catch (err: any) {
      this.toast.error('No se pudo actualizar el estado del pedido.');
    }
  }

  async toggleHabilitado(usuario: UsuarioAdmin) {
    // ... (tu código existente de usuarios)
    const nuevoEstado = !usuario.habilitado;
    this.procesandoId.set(usuario.id);

    try {
      await firstValueFrom(
        this.http.patch(
          `https://epigrafe.onrender.com/api/admin/usuarios/${usuario.id}/estado`,
          { habilitado: nuevoEstado },
          { headers: this.headers() }
        )
      );

      this.usuarios.update((lista) =>
        lista.map((u) => (u.id === usuario.id ? { ...u, habilitado: nuevoEstado } : u))
      );

      this.toast.info(nuevoEstado ? `Cuenta de ${usuario.nombre} habilitada.` : `Cuenta de ${usuario.nombre} deshabilitada.`);
    } catch (err: any) {
      this.toast.info(err?.error?.error || 'No se pudo actualizar el estado de la cuenta.');
    } finally {
      this.procesandoId.set(null);
    }
  }

  async toggleRequiereCambioPassword(usuario: UsuarioAdmin) {
    // ... (tu código existente)
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

  // V2 — Vinculación de relojes: el reloj muestra un código de 6 dígitos y aquí se confirma.
  async cargarRelojes() {
    try {
      const datos = await firstValueFrom(
        this.http.get<RelojVinculado[]>('https://epigrafe.onrender.com/api/reloj/dispositivos')
      );
      this.relojes.set(datos);
    } catch (err: any) {
      console.error('Error al cargar relojes:', err);
    }
  }

  onCodigoReloj(event: Event) {
    const valor = (event.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6);
    (event.target as HTMLInputElement).value = valor;
    this.codigoReloj.set(valor);
  }

  async vincularReloj() {
    const codigo = this.codigoReloj();
    if (!/^\d{6}$/.test(codigo)) {
      this.toast.error('Escribe el código de 6 dígitos que aparece en el reloj.');
      return;
    }
    this.vinculandoReloj.set(true);
    try {
      await firstValueFrom(
        this.http.post('https://epigrafe.onrender.com/api/reloj/vinculacion/confirmar', { codigo })
      );
      this.toast.exito('Reloj vinculado. En unos segundos mostrará los pedidos.');
      this.codigoReloj.set('');
      // El token se crea cuando el reloj lo recoge; se recarga la lista un poco después.
      setTimeout(() => this.cargarRelojes(), 8000);
    } catch (err: any) {
      this.toast.error(err?.error?.error || 'No se pudo vincular el reloj.');
    } finally {
      this.vinculandoReloj.set(false);
    }
  }

  async desvincularReloj(reloj: RelojVinculado) {
    try {
      await firstValueFrom(
        this.http.delete(`https://epigrafe.onrender.com/api/reloj/dispositivos/${reloj.jti}`)
      );
      this.relojes.update((lista) => lista.filter((r) => r.jti !== reloj.jti));
      this.toast.info('Reloj desvinculado. Ya no puede ver ni modificar pedidos.');
    } catch (err: any) {
      this.toast.error(err?.error?.error || 'No se pudo desvincular el reloj.');
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
