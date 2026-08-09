import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clasicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clasicos.component.html'
})
export class Clasicos {
  // Simulación de catálogo filtrado
  clasicos = [
    { titulo: 'Orgullo y Prejuicio', autor: 'Jane Austen', descripcion: 'Una crítica magistral a las costumbres sociales de la Inglaterra del siglo XIX.', imagen: '/img/orgulloprejuicio.png' },
    { titulo: 'Cien Años de Soledad', autor: 'Gabriel García Márquez', descripcion: 'La obra cumbre del realismo mágico latinoamericano.', imagen: '/img/libro-cien.png' },
    { titulo: 'El Retrato de Dorian Gray', autor: 'Oscar Wilde', descripcion: 'Una reflexión profunda sobre la vanidad y la moralidad.', imagen: '/img/libro-dorian.png' }
  ];
}
