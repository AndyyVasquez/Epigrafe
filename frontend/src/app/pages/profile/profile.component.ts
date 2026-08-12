import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-md mx-auto px-6 py-12 bg-white rounded-xl shadow-sm border mt-10">
      <h2 class="text-2xl font-bold text-verde-epigrafe mb-6">Mi Perfil / Seguridad</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Contraseña Actual</label>
          <input type="password" [(ngModel)]="passwordActual" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">Nueva Contraseña</label>
          <input type="password" [(ngModel)]="nuevoPassword" class="w-full px-3 py-2 border rounded-lg text-sm">
        </div>
        <button (click)="cambiarPassword()" class="w-full bg-verde-epigrafe text-crema-fondo py-2.5 rounded-xl font-bold text-sm">
          Actualizar Contraseña
        </button>
      </div>
    </div>
  `
})
export class Profile {
  passwordActual = '';
  nuevoPassword = '';

  constructor(private http: HttpClient, private toast: ToastService) {}

  cambiarPassword() {
    const usuarioStr = localStorage.getItem('usuario');
    if (!usuarioStr) return;
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