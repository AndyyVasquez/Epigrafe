import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html'
})
export class Faq {
  preguntas = [
    { pregunta: '¿Tienen opciones veganas?', respuesta: 'Sí, contamos con opciones de panadería y leches vegetales.' },
    { pregunta: '¿Aceptan pagos con tarjeta?', respuesta: 'Aceptamos todas las tarjetas de crédito y débito, así como transferencias.' },
    { pregunta: '¿Puedo reservar mesas?', respuesta: 'Sí, las reservas se pueden hacer directamente por WhatsApp.' }
  ];

  preguntaAbierta: number | null = null;

  togglePregunta(index: number) {
    this.preguntaAbierta = this.preguntaAbierta === index ? null : index;
  }
}
