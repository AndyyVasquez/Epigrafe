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
      titulo: 'Círculo de Poesía Contemporánea',
      fecha: '14 de agosto',
      hora: '18:00',
      descripcion: 'Acompañanos en una velada dedicada a la poesía moderna y café de especialidad.'
    },
    {
      titulo: 'Taller de Encuadernación Artesanal',
      fecha: '28 de agosto',
      hora: '17:00',
      descripcion: 'Aprende las técnicas básicas para encuadernar tus propias libretas y libros.'
    }
  ];
}