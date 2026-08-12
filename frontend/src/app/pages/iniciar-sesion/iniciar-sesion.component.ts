import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './iniciar-sesion.component.html',
  styleUrl: './iniciar-sesion.component.css'
})
export class IniciarSesion {
  correo = '';
  password = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  iniciarSesion() {
    const credenciales = { correo: this.correo, password: this.password };

    this.http.post<any>('https://epigrafe.onrender.com/api/auth/login', credenciales)
      .subscribe({
        next: (res) => {
          // Guardar token y datos del usuario en localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));

          // Avisar al AuthService: esto es lo que hace que el navbar
          // (suscrito a authService.user$ vía el pipe async) se actualice
          // solo, sin recargar la página.
          this.authService.updateUser(res.usuario);

          this.toast.exito('Bienvenido de nuevo, ' + res.usuario.nombre);

          // Redirección inteligente basada en el rol
          if (res.usuario.rol === 'Administrador') {
            this.router.navigate(['/admin/dashboard']);
          } else if (res.usuario.rol === 'Editor') {
            this.router.navigate(['/editor/catalogo']);
          } else {
            this.router.navigate(['/']); // Redirección estándar para Usuarios
          }
        },
        error: (err) => {
          console.error(err);
          this.toast.error(err.error?.error || 'Error al iniciar sesión');
        }
      });
  }
}