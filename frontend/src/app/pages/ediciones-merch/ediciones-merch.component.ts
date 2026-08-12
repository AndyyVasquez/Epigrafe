import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { Carrito } from '../../services/carrito.service';

@Component({
  selector: 'app-ediciones-merch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ediciones-merch.component.html'
})
export class EdicionesMerch {
  
   constructor(
    private carrito: Carrito,
    private toast: ToastService
  ) {}

  agregarAlCarrito(item: any) {
    this.carrito.agregarAlCarrito(item);
    this.toast.info(`¡"${item.titulo || item.nombre}" agregado al pickup!`);
  }
  items = [
    { nombre: 'Taza de Cerámica Epígrafe', precio: 185, categoria: 'Merch', imagen: '/img/merch-taza.png' },
    { nombre: 'Separador de Madera Tallada', precio: 95, categoria: 'Merch', imagen: '/img/merch-separador.png' },
    { nombre: 'Edición Ilustrada: Orgullo y Prejuicio', precio: 490, categoria: 'Edición Especial', imagen: '/img/edicion-orgullo.png' },
    { nombre: 'Tote Bag "Velaris Art Festival"', precio: 210, categoria: 'Merch', imagen: '/img/merch-tote.png' },
    { nombre: 'Box Set: Acotar edición Velaris', precio: 850, categoria: 'Edición Especial', imagen: '/img/edicion-acotar.png' },
    { nombre: 'Vela Aromática "Olor a Libro Viejo"', precio: 160, categoria: 'Merch', imagen: '/img/merch-vela.png' }
  ];
}
