import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-registro',
  imports: [FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})

export class Registro {
  usuario = { nombre: '', apellidos: '', correo: '', password: '', telefono: '', genero: '', gusto_literario: '' };

  constructor(private http: HttpClient, private router: Router, private toast: ToastService) {}

  registrarUsuario() {
    this.http.post('https://epigrafe.onrender.com/api/auth/registro', this.usuario)
      .subscribe({
        next: () => {
          this.toast.exito('Registro exitoso. ¡Bienvenido a Epígrafe!');
          this.router.navigate(['/']);
        },
        error: (err) => this.toast.error(err.error?.error || 'Error al registrar')
      });
  }
}