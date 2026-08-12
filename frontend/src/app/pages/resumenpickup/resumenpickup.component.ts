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
    this.total = this.productos.reduce((acc, item) => acc + Number(item.precio || 0), 0);
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
    if (this.productos.length === 0) {
      this.toast.info('Tu carrito de pickup está vacío.');
      return;
    }

    if (!this.nombreCliente || !this.correoCliente) {
      this.toast.info('Por favor completa tu nombre y correo para el apartado.');
      return;
    }

    this.cargando = true;

    const datosPedido = {
      nombre_cliente: this.nombreCliente,
      correo_cliente: this.correoCliente,
      telefono_cliente: this.telefonoCliente || 'No proporcionado',
      productos: this.productos,
      total: this.total
    };

    this.carrito.enviarPedido(datosPedido).subscribe({
      next: (res) => {
        this.toast.info('¡Pedido registrado con éxito! Te esperamos en mostrador.');
        this.carrito.vaciarCarrito();
        this.cargando = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.toast.info('Hubo un error al procesar tu pedido. Intenta de nuevo.');
        this.cargando = false;
      }
    });
  }
}