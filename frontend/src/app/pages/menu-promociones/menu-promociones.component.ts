import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu-promociones',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu-promociones.component.html'
})
export class MenuPromociones {
  promociones = [
    {
      nombre: 'Combo Lector',
      descripcion: 'Elige cualquier método de extracción manual + un postre de nuestra vitrina y llévate un separador de libros de edición especial.',
      precioEspecial: 110,
      etiqueta: 'Más Popular'
    },
    {
      nombre: 'Descuento Universitario',
      descripcion: 'Presenta tu credencial de estudiante universitario vigente y obtén un 15% de descuento en toda tu cuenta de cafetería.',
      precioEspecial: null,
      etiqueta: '-15% OFF'
    },
    {
      nombre: 'Tardes de Club',
      descripcion: 'Todos los jueves de 4:00 pm a 8:00 pm disfruta de un 2x1 en nuestro Latte de Especialidad y Americanos.',
      precioEspecial: 65,
      etiqueta: 'Jueves 2x1'
    },
    {
      nombre: 'Lleva tu Boli',
      descripcion: 'En la compra de cualquier libro de nuestra sección de novedades, llévate un boli artesanal de elote, frutos rojos u Oreo a mitad de precio.',
      precioEspecial: 8.50,
      etiqueta: 'Refrescante'
    }
  ];
}
