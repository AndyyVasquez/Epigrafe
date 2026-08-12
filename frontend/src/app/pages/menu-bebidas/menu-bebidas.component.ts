import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Carrito } from '../../services/carrito.service';
import { ToastService } from '../../services/toast.service'; 

@Component({
  selector: 'app-menu-bebidas',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu-bebidas.component.html',
  styleUrl: './menu-bebidas.component.css'
})
export class MenuBebidas implements OnInit {
  bebidas: any[] = [];

  constructor(
    private http: HttpClient,
    private carrito: Carrito,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.http.get<any[]>('https://epigrafe.onrender.com/api/catalogo?categoria=bebida')
      .subscribe({
        next: (data) => {
          this.bebidas = data;
        },
        error: (err) => {
          console.error('Error al cargar bebidas:', err);
          this.toast.info('No se pudieron cargar las bebidas del servidor.');
        }
      });
  }
  
  agregarAlCarrito(item: any) {
    this.carrito.agregarAlCarrito(item);
    this.toast.info(`¡"${item.titulo || item.nombre}" agregado al pickup!`);
  }
}