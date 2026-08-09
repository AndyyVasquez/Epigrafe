import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu-postres',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu-postres.component.html',
  styleUrl: './menu-postres.component.css'
})
export class MenuPostres {
  postres = [
    { nombre: 'Croissant Clásico', descripcion: 'Horneado cada mañana. Textura hojaldrada y mantequilla pura, perfecto para acompañar tu americano.', precio: 45, tipo: 'Panadería' },
    { nombre: 'Tarta de Higo y Nuez', descripcion: 'Base de masa quebrada, crema pastelera ligera y la dulzura natural del higo fresco.', precio: 85, tipo: 'Repostería' },
    { nombre: 'Panqué de Limón y Chía', descripcion: 'Esponjoso y con un glaseado cítrico sutil que equilibra perfectamente la dulzura.', precio: 55, tipo: 'Panadería' },
    { nombre: 'Cheesecake Epígrafe', descripcion: 'Clásico estilo Nueva York, horneado lentamente y coronado con compota de frutos rojos.', precio: 90, tipo: 'Repostería' },
    { nombre: 'Rol de Canela Artesanal', descripcion: 'Masa madre suave, canela de Ceilán y un glaseado de queso crema irresistible.', precio: 60, tipo: 'Panadería' },
    { nombre: 'Galleta de Sal Marina', descripcion: 'Chispas de chocolate semiamargo y un toque de sal en escamas que resalta el cacao.', precio: 40, tipo: 'Repostería' }
  ];
}
