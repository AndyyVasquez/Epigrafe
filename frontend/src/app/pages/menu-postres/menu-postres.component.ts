import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Carrito } from '../../services/carrito.service';
import { ToastService } from '../../services/toast.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-menu-postres',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu-postres.component.html',
  styleUrl: './menu-postres.component.css'
})
export class MenuPostres {
  postres: any[] = [];

  constructor(
    private http: HttpClient,
    private carrito: Carrito,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.http.get<any[]>('https://epigrafe.onrender.com/api/catalogo?categoria=postre')
      .subscribe({
        next: (data) => {
          this.postres = data;
        },
        error: (err) => {
          console.error('Error al cargar postres:', err);
          this.toast.info('No se pudieron cargar los postres del servidor.');
        }
      });
  }

  agregarAlCarrito(item: any) {
    this.carrito.agregarAlCarrito(item);
    this.toast.info(`¡"${item.titulo || item.nombre}" agregado al pickup!`);
  }

 
}
