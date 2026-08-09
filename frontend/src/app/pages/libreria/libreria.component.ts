import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-libreria',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './libreria.component.html',
  styleUrl: './libreria.component.css',
})
export class Libreria {
  catalogo = [
    { titulo: 'El trato', autor: 'Elle Kennedy', categoria: 'Romance', precio: 290, imagen: '/img/thedeal.png', destacado:false },
    { titulo: 'Orgullo y Prejuicio', autor: 'Jane Austen', categoria: 'Clásicos', precio: 220, imagen: '/img/orgulloprejuicio.png', destacado:false },
    { titulo: 'Hábitos Atómicos', autor: 'James Clear', categoria: 'Productividad', precio: 350, imagen: '/img/libro-habitos.png', destacado:false },
    { titulo: 'Cien Años de Soledad', autor: 'Gabriel García Márquez', categoria: 'Clásicos', precio: 320, imagen: '/img/libro-cien.png', destacado:false },
    { titulo: 'El Psicoanalista', autor: 'John Katzenbach', categoria: 'Misterio', precio: 280, imagen: '/img/libro-psico.png', destacado:false }
  ];
}
