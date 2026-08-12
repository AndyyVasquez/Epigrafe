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
  nuevoProducto = {
    categoria: 'bebida',
    titulo: '',
    autor: '',
    descripcion: '',
    precio: 0,
    stock: 10,
    imagen: '',
    tipo_etiqueta: 'Caliente'
  };

  private apiUrl = 'https://epigrafe.onrender.com/api/catalogo';

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.cargarCatalogo();
  }

  cargarCatalogo() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => this.productos = data);
  }

  guardarProducto() {
    this.http.post(this.apiUrl, this.nuevoProducto).subscribe({
      next: () => {
        this.toast.info('¡Producto agregado con éxito!');
        this.cargarCatalogo();
        this.nuevoProducto = { categoria: 'bebida', titulo: '', autor: '', descripcion: '', precio: 0, stock: 10, imagen: '', tipo_etiqueta: 'Caliente' };
      },
      error: () => this.toast.info('Error al guardar el producto.')
    });
  }

  eliminarProducto(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.toast.info('Producto eliminado.');
        this.cargarCatalogo();
      },
      error: () => this.toast.info('Error al eliminar.')
    });
  }
}