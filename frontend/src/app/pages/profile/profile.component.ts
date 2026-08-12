import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class Profile {
  passwordActual = '';
  nuevoPassword = '';

  constructor(private http: HttpClient, private toast: ToastService) {}

  cambiarPassword() {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) {
      this.toast.info('No hay sesión activa.');
      return;
    }
    const usuario = JSON.parse(usuarioStr);

    this.http.put('https://epigrafe.onrender.com/api/usuarios/cambiar-password', {
      correo: usuario.correo,
      passwordActual: this.passwordActual,
      nuevoPassword: this.nuevoPassword
    }).subscribe({
      next: () => {
        this.toast.info('¡Contraseña actualizada correctamente!');
        this.passwordActual = '';
        this.nuevoPassword = '';
      },
      error: (err) => {
        this.toast.info(err?.error?.error || 'No se pudo actualizar la contraseña.');
      }
    });
  }
}