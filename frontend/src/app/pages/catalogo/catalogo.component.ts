import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.component.html'
})
export class Catalogo implements OnInit {
  libros: any[] = [];
  filtroSeleccionado = 'Todos';
  terminoBusqueda = '';

  private apiUrl = 'https://epigrafe.onrender.com/api/catalogo?categoria=libro';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.libros = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar catálogo:', err)
    });
  }

  get librosFiltrados() {
    return this.libros.filter(libro => {
      const categoria = (libro.tipo_etiqueta || libro.categoria || '').toLowerCase();
      const filtro = this.filtroSeleccionado.toLowerCase();
      const cumpleCategoria = this.filtroSeleccionado === 'Todos' || categoria.includes(filtro);

      const titulo = (libro.titulo || libro.nombre || '').toLowerCase();
      const cumpleBusqueda = titulo.includes(this.terminoBusqueda.toLowerCase());

      return cumpleCategoria && cumpleBusqueda;
    });
  }
}