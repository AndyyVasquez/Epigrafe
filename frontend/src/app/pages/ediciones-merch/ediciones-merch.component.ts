import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  private apiUrl = 'https://epigrafe.onrender.com/api/catalogo';

  constructor(
    private http: HttpClient,
    private carrito: Carrito,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarMerch();
  }

  cargarMerch() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        // Traemos todo lo que sea merch o edición especial de forma flexible
        this.items = (data || []).filter(item => {
          const cat = (item.categoria || '').toLowerCase();
          return cat.includes('merch') || cat.includes('edicion') || cat.includes('especial');
        });
        this.cdr.detectChanges();
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