import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.component.html'
})
export class Catalogo {
  // Datos base
  libros = [
    { titulo: 'El Psicoanalista', autor: 'John Katzenbach', categoria: 'Misterio', precio: 280, imagen: '/img/libro-psico.png' },
    { titulo: 'Orgullo y Prejuicio', autor: 'Jane Austen', categoria: 'Clásicos', precio: 220, imagen: '/img/orgulloprejuicio.png' },
    { titulo: 'Hábitos Atómicos', autor: 'James Clear', categoria: 'Productividad', precio: 350, imagen: '/img/libro-habitos.png' }
  ];

  filtroSeleccionado = 'Todos';
  terminoBusqueda = '';

  // Esta función es el "corazón" del filtrado reactivo
  get librosFiltrados() {
    return this.libros.filter(libro => {
      // Filtra por categoría
      const cumpleCategoria = this.filtroSeleccionado === 'Todos' || libro.categoria === this.filtroSeleccionado;

      // Filtra por texto (búsqueda tipo Bamboo)
      const cumpleBusqueda = libro.titulo.toLowerCase().includes(this.terminoBusqueda.toLowerCase());

      return cumpleCategoria && cumpleBusqueda;
    });
  }
}
