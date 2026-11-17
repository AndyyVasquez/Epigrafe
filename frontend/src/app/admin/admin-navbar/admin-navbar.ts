import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-navbar.html'
})
export class AdminNavbarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  async cerrarSesion() {
    await this.authService.cerrarSesion(); // V6: revoca el token en el servidor
    // Forzar recarga o redirección al login
    this.router.navigate(['/login']);
  }
}
