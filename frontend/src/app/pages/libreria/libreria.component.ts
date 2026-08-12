import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { Carrito } from '../../services/carrito.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-libreria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libreria.component.html',
  styleUrls: ['./libreria.component.css']
})
export class Libreria {

  
  terminoBusqueda: string = '';
  filtroCategoria: string = 'todos';

  // Lista de ejemplo (conéctala a tu servicio o arreglo existente)
  libros = [
    
 { titulo: 'El trato', autor: 'Elle Kennedy', categoria: 'Romance', precio: 290, imagen: '/img/thedeal.png', destacado:false },
    { titulo: 'Orgullo y Prejuicio', autor: 'Jane Austen', categoria: 'Clásicos', precio: 220, imagen: '/img/orgulloprejuicio.png', destacado:false },
    { titulo: 'Hábitos Atómicos', autor: 'James Clear', categoria: 'Productividad', precio: 350, imagen: '/img/libro-habitos.png', destacado:false },
    { titulo: 'Cien Años de Soledad', autor: 'Gabriel García Márquez', categoria: 'Clásicos', precio: 320, imagen: '/img/libro-cien.png', destacado:false },
    { titulo: 'El Psicoanalista', autor: 'John Katzenbach', categoria: 'Misterio', precio: 280, imagen: '/img/libro-psico.png', destacado:false }
  ];

  get librosFiltrados() {
    return this.libros.filter(libro => {
      const coincideTexto = libro.titulo.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
                            libro.autor.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      const coincideCat = this.filtroCategoria === 'todos' || libro.categoria === this.filtroCategoria;
      return coincideTexto && coincideCat;
    });
  }

constructor(private carritoService: Carrito, private toast: ToastService) {}

comprarParaPickup(libro: any) {
  this.carritoService.agregarAlCarrito(libro);
  this.toast.info(`"${libro.titulo}" añadido para pickup.`);
}
}
