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
  catalogo: any[] = [];
  nuevoLibro = {
    categoria: 'libro',
    titulo: '',
    autor: '',
    descripcion: '',
    precio: 0,
    stock: 10,
    imagen: 'img/libro-default.jpg'
  };

  private apiUrl = 'https://epigrafe.onrender.com/api/catalogo';

  constructor(private http: HttpClient, private toast: ToastService) {}

  ngOnInit() {
    this.cargarCatalogo();
  }

  cargarCatalogo() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => this.catalogo = data);
  }

  agregarLibro() {
    this.http.post(this.apiUrl, this.nuevoLibro).subscribe({
      next: () => {
        this.toast.info('¡Producto agregado con éxito!');
        this.cargarCatalogo();
        this.nuevoLibro = { categoria: 'libro', titulo: '', autor: '', descripcion: '', precio: 0, stock: 10, imagen: 'img/libro-default.jpg' };
      },
      error: () => this.toast.info('Error al guardar el producto.')
    });
  }

  eliminarLibro(libro: any) {
    this.http.delete(`${this.apiUrl}/${libro.id}`).subscribe({
      next: () => {
        this.toast.info('Producto eliminado.');
        this.cargarCatalogo();
      },
      error: () => this.toast.info('Error al eliminar.')
    });
  }

  editarLibro(libro: any) {
    this.toast.info(`Función de edición para: ${libro.titulo}`);
  }
}