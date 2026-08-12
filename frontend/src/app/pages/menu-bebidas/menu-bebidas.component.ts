import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Carrito } from '../../services/carrito.service';
import { ToastService } from '../../services/toast.service'; 

@Component({
  selector: 'app-menu-bebidas',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu-bebidas.component.html',
  styleUrl: './menu-bebidas.component.css'
})
export class MenuBebidas {

   constructor(
    private carrito: Carrito,
    private toast: ToastService
  ) {}
  
  agregarAlCarrito(item: any) {
    this.carrito.agregarAlCarrito(item);
    // Usamos tu Toast personalizado para avisarle al usuario
    this.toast.info(`¡"${item.titulo || item.nombre}" agregado al pickup!`);
  }

  bebidas = [
    { nombre: 'Espresso Doble', descripcion: 'Extracción intensa de notas achocolatadas y cuerpo denso.', precio: 45, tipo: 'Caliente' },
    { nombre: 'Americano', descripcion: 'Espresso diluido en agua caliente, ideal para notas florales.', precio: 50, tipo: 'Caliente' },
    { nombre: 'Latte de Especialidad', descripcion: 'Espresso balanceado con leche cremada fina y sedosa.', precio: 65, tipo: 'Caliente' },
    { nombre: 'Método Chemex', descripcion: 'Filtrado artesanal que destaca la brillantez y acidez limpia del grano.', precio: 75, tipo: 'Método' },
    { nombre: 'Cold Brew Tradicional', descripcion: 'Infusión en frío por 18 horas, refrescante y naturalmente dulce.', precio: 70, tipo: 'Frío' },
    { nombre: 'Espresso Tonic', descripcion: 'Doble shot de espresso sobre agua tónica premium y hielo.', precio: 75, tipo: 'Frío' }
  ];
}

