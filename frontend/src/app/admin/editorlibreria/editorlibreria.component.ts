import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-libreria',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './editorlibreria.component.html'
})
export class EditorLibreria {
  catalogo: any[] = [/* ... tus libros actuales ... */];
  nuevoLibro = { titulo: '', autor: '', precio: 0, imagen: '' };

  constructor(private toast: ToastService) {}

  agregarLibro() {
    // Aquí llamarías a: this.http.post('https://epigrafe.onrender.com/api/libros', this.nuevoLibro)...
    this.catalogo.push({ ...this.nuevoLibro, categoria: 'General', destacado: false });
    this.nuevoLibro = { titulo: '', autor: '', precio: 0, imagen: '' };
  }

  eliminarLibro(libro: any) {
    this.catalogo = this.catalogo.filter(l => l !== libro);
  }

  editarLibro(libro: any) {
    // Lógica para abrir un modal o formulario de edición
    this.toast.info('Funcionalidad de edición activada para: ' + libro.titulo);
  }
}