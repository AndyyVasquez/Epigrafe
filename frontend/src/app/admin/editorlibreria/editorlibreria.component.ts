import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-editor-libreria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editorlibreria.component.html',
  styleUrl: './editorlibreria.component.css'
})
export class EditorLibreria implements OnInit {
  productos: any[] = [];
  categoriaActiva: string = 'libro'; // 'libro', 'bebida', 'postre', 'promocion', 'merch'
  busqueda: string = '';

  nuevo = {
    categoria: 'libro',
    titulo: '',
    autor: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    imagen: '',
    tipo_etiqueta: 'General'
  };

  private apiUrl = 'https://epigrafe.onrender.com/api/catalogo';

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.cargarCatalogo();
  }

  cargarCatalogo() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.productos = data,
      error: () => this.toast.info('Error al cargar el inventario.')
    });
  }

  cambiarPestana(cat: string) {
    this.categoriaActiva = cat;
    this.nuevo.categoria = cat; // Sincroniza la categoría del formulario
  }

  get productosFiltrados() {
    return this.productos.filter(p => {
      const coincideCat = p.categoria === this.categoriaActiva;
      const texto = (p.titulo || p.nombre || '').toLowerCase();
      const coincideBusqueda = texto.includes(this.busqueda.toLowerCase());
      return coincideCat && coincideBusqueda;
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.nuevo.imagen = reader.result as string; // Convierte la imagen a String Base64
      };
      reader.readAsDataURL(file);
    }
  }

  guardarProducto() {
    this.http.post(this.apiUrl, this.nuevo).subscribe({
      next: () => {
        this.toast.info('¡Producto guardado con éxito!');
        this.cargarCatalogo();
        this.nuevo.titulo = '';
        this.nuevo.descripcion = '';
        this.nuevo.precio = 0;
        this.nuevo.stock = 0;
        this.nuevo.imagen = '';
      },
      error: () => this.toast.info('Error al guardar el producto.')
    });
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás segura de eliminar este producto?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.toast.info('Producto eliminado.');
          this.cargarCatalogo();
        },
        error: () => this.toast.info('No se pudo eliminar.')
      });
    }
  }
}