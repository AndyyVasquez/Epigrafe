
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-registro',
  imports: [FormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})

export class Registro {
  usuario = { nombre: '', apellidos: '', correo: '', password: '', telefono: '', genero: '', gusto_literario: '' };

  constructor(private http: HttpClient, private router: Router) {}

  registrarUsuario() {
    this.http.post('http://localhost:3000/api/auth/registro', this.usuario)
      .subscribe({
        next: () => {
          alert('Registro exitoso. ¡Bienvenido a Epígrafe!');
          this.router.navigate(['/']);
        },
        error: (err) => alert('Error al registrar: ' + err.error.error)
      });
  }
}
