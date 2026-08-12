import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';
import { Carrito } from '../../services/carrito.service';

@Component({
  selector: 'app-ediciones-merch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ediciones-merch.component.html'
})
export class EdicionesMerch implements OnInit {
  items: any[] = [];
  private apiUrl = 'https://epigrafe.onrender.com/api/catalogo'; // Puedes filtrar o traer todo y filtrar en frontend

  constructor(
    private http: HttpClient,
    private carrito: Carrito,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.cargarMerch();
  }

  cargarMerch() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        // Filtramos las categorías de merch o ediciones especiales creadas desde el admin
        this.items = data.filter(item => 
          item.categoria === 'merch' || item.categoria === 'edicion' || item.categoria === 'Edición Especial'
        );
      },
      error: (err) => {
        console.error('Error al cargar merch:', err);
      }
    });
  }

  agregarAlCarrito(item: any) {
    if (item.stock <= 0) {
      this.toast.info('Este producto se encuentra agotado.');
      return;
    }
    this.carrito.agregarAlCarrito(item);
    this.toast.info(`¡"${item.titulo || item.nombre}" agregado al pickup!`);
  }
}