import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Carrito } from '../../services/carrito.service'; 
import { AuthService } from '../../auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-resumen-pickup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resumenpickup.component.html',
  styleUrls: ['./resumenpickup.component.css']
})
export class ResumenPickup implements OnInit {
  productos: any[] = [];
  total: number = 0;
  
  // Datos del cliente (puedes prellenarlos si el usuario ya inició sesión)
  nombreCliente: string = '';
  correoCliente: string = '';
  telefonoCliente: string = '';
  
  cargando: boolean = false;

  constructor(
    private carrito: Carrito,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.precargarDatosUsuario();
  }

  cargarProductos() {
    this.productos = this.carrito.obtenerCarrito();
    this.calcularTotal();
  }

  calcularTotal() {
    let subtotal = 0;
    let porcentajeDescuento = 0;

    // 1. Primero sumamos los productos normales y detectamos si hay cupones de descuento
    this.productos.forEach(item => {
      const nombreItem = (item.titulo || item.nombre || '').toLowerCase();

      // Si el item es el descuento universitario u otra promo de porcentaje
      if (nombreItem.includes('descuento universitario') || nombreItem.includes('15%')) {
        porcentajeDescuento = 15; // 15% de descuento
      } else {
        subtotal += Number(item.precio || 0);
      }
    });

    // 2. Aplicamos el descuento si existe
    if (porcentajeDescuento > 0) {
      const descuento = (subtotal * porcentajeDescuento) / 100;
      this.total = Math.max(0, subtotal - descuento);
    } else {
      this.total = subtotal;
    }
  }

  eliminarItem(index: number) {
    this.productos.splice(index, 1);
    localStorage.setItem('carrito_pickup', JSON.stringify(this.productos));
    this.calcularTotal();
  }

  precargarDatosUsuario() {
    // Si tienes el usuario activo, puedes autocompletar sus datos
    this.authService.user$.subscribe(user => {
      if (user) {
        this.nombreCliente = `${user.nombre} ${user.apellidos || ''}`;
        this.correoCliente = user.correo || '';
      }
    });
  }

confirmarPedido() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.toast.info('Inicia sesión para poder realizar tu apartado en pickup.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.productos.length === 0) {
      this.toast.info('Tu carrito de pickup está vacío.');
      return;
    }

    if (!this.nombreCliente || !this.correoCliente) {
      this.toast.info('Por favor completa tu nombre y correo para el apartado.');
      return;
    }

    this.cargando = true;

    let usuarioId = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      usuarioId = payload.id;
    } catch (e) {
      console.error('No se pudo leer el token', e);
    }

    const datosPedido = {
      usuario_id: usuarioId, 
      nombre_cliente: this.nombreCliente,
      correo_cliente: this.correoCliente,
      telefono_cliente: this.telefonoCliente || 'No proporcionado',
      productos: this.productos,
      total: this.total
    };

    // Enviar el pedido (el servicio espera solo los datos del pedido)
    this.carrito.enviarPedido(datosPedido).subscribe({
      next: (res) => {
        this.toast.info('¡Pedido registrado con éxito! Te esperamos en mostrador.');
        this.carrito.vaciarCarrito();
        this.cargando = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.toast.info(err?.error?.error || 'Hubo un error al procesar tu pedido. Intenta de nuevo.');
        this.cargando = false;
      }
    });
  }
}