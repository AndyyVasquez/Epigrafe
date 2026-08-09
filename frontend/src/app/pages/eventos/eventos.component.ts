import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventos.component.html'
})
export class Eventos {
  eventos = [
    {
      titulo: 'Presentación de Libro',
      fecha: '15 de julio',
      hora: '18:00',
      descripcion: 'Acompañanos en el lanzamiento de la nueva novela de autores locales.'
    },
    {
      titulo: 'Taller de Poesía',
      fecha: '22 de julio',
      hora: '17:00',
      descripcion: 'Explora tu lado creativo en nuestra tarde de versos y café.'
    }
  ];
}
