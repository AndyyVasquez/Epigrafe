import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class Navbar {

  constructor(public authService: AuthService, private router: Router, private toast: ToastService) {}

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.authService.updateUser(null);
    this.toast.info('Cerraste sesión correctamente.');
    this.router.navigate(['/']); // Redirige al inicio
  }
}