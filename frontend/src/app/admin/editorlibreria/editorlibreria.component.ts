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
  categoriaActiva: string = 'libro';
  busqueda: string = '';
  
  // Control de edición
  modoEdicion: boolean = false;
  productoEditandoId: number | null = null;

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
    this.cancelarEdicion();
    this.nuevo.categoria = cat;
  }

  get productosFiltrados() {
    return this.productos.filter(p => {
      const coincideCat = p.categoria === this.categoriaActiva;
      const texto = (p.titulo || p.nombre || '').toLowerCase();
      return coincideCat && texto.includes(this.busqueda.toLowerCase());
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.nuevo.imagen = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  guardarProducto() {
    if (this.modoEdicion && this.productoEditandoId !== null) {
      // Petición PUT para actualizar
      this.http.put(`${this.apiUrl}/${this.productoEditandoId}`, this.nuevo).subscribe({
        next: () => {
          this.toast.info('¡Producto actualizado con éxito!');
          this.cargarCatalogo();
          this.cancelarEdicion();
        },
        error: () => this.toast.info('Error al actualizar el producto.')
      });
    } else {
      // Petición POST para crear nuevo
      this.http.post(this.apiUrl, this.nuevo).subscribe({
        next: () => {
          this.toast.info('¡Producto creado con éxito!');
          this.cargarCatalogo();
          this.limpiarFormulario();
        },
        error: () => this.toast.info('Error al guardar el producto.')
      });
    }
  }

  cargarParaEditar(item: any) {
    this.modoEdicion = true;
    this.productoEditandoId = item.id;
    this.nuevo = {
      categoria: item.categoria,
      titulo: item.titulo || item.nombre,
      autor: item.autor || '',
      descripcion: item.descripcion || '',
      precio: item.precio,
      stock: item.stock,
      imagen: item.imagen || '',
      tipo_etiqueta: item.tipo_etiqueta || 'General'
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.productoEditandoId = null;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevo = {
      categoria: this.categoriaActiva,
      titulo: '',
      autor: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      imagen: '',
      tipo_etiqueta: 'General'
    };
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