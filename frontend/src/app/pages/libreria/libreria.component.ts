import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Carrito } from '../../services/carrito.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-libreria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libreria.component.html',
  styleUrls: ['./libreria.component.css']
})
export class Libreria implements OnInit {
  terminoBusqueda: string = '';
  filtroCategoria: string = 'todos';
  libros: any[] = [];

  private apiUrl = 'https://epigrafe.onrender.com/api/catalogo?categoria=libro';

  constructor(
    private http: HttpClient,
    private carritoService: Carrito, 
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarLibros();
  }

  cargarLibros() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.libros = data || [];
        this.cdr.detectChanges(); // Fuerza la carga visual inmediata
      },
      error: (err) => {
        console.error('Error al cargar libros:', err);
        this.toast.info('No se pudieron cargar los libros del servidor.');
      }
    });
  }

  get librosFiltrados() {
    return this.libros.filter(libro => {
      const titulo = libro.titulo || libro.nombre || '';
      const autor = libro.autor || '';
      const categoria = (libro.categoria || '').toLowerCase();
      const etiqueta = (libro.tipo_etiqueta || '').toLowerCase();
      const filtro = this.filtroCategoria.toLowerCase();

      const coincideTexto = titulo.toLowerCase().includes(this.terminoBusqueda.toLowerCase()) ||
                            autor.toLowerCase().includes(this.terminoBusqueda.toLowerCase());
      
      const coincideCat = filtro === 'todos' || categoria.includes(filtro) || etiqueta.includes(filtro);
      
      return coincideTexto && coincideCat;
    });
  }

  comprarParaPickup(libro: any) {
    if (libro.stock <= 0) {
      this.toast.info('Este producto se encuentra agotado.');
      return;
    }
    this.carritoService.agregarAlCarrito(libro);
    this.toast.info(`"${libro.titulo || libro.nombre}" añadido para pickup.`);
  }
}