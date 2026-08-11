import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Estados posibles del formulario. El DOM se actualiza en función de este
// estado (ver contacto-mensaje.component.html), nunca lo tocamos a mano.
type EstadoEnvio = 'inactivo' | 'enviando' | 'exito' | 'error';

@Component({
  selector: 'app-contacto-mensaje',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contactomsj.component.html',
  styleUrl: './contactomsj.component.css',
})
export class Contactomsj {
  // Modelo del formulario, enlazado con [(ngModel)] en el HTML
  form = { nombre: '', correo: '', asunto: '', mensaje: '' };

  estado: EstadoEnvio = 'inactivo';
  mensajeError = '';

  constructor(private http: HttpClient) {}

  // Comunicación asíncrona con el backend usando async/await.
  //
  // 1. El navegador NO se congela mientras espera la respuesta del servidor:
  //    el usuario sigue pudiendo interactuar con el resto de la página.
  // 2. `firstValueFrom` convierte el Observable de HttpClient en una Promise,
  //    así podemos usar await en vez de .subscribe().
  // 3. Mientras la petición está en curso, `estado = 'enviando'` hace que el
  //    DOM muestre un spinner y deshabilite el botón (evita doble envío).
  async enviarMensaje(formulario: any) {
    if (formulario.invalid) {
      formulario.form.markAllAsTouched?.();
      return;
    }

    this.estado = 'enviando';
    this.mensajeError = '';

    try {
      await firstValueFrom(
        this.http.post<{ mensaje: string; id: number }>(
          'https://epigrafe.onrender.com/api/contacto',
          this.form
        )
      );

      this.estado = 'exito';
      this.form = { nombre: '', correo: '', asunto: '', mensaje: '' };
    } catch (err: any) {
      this.estado = 'error';
      this.mensajeError =
        err?.error?.errores?.[0]?.msg ||
        err?.error?.error ||
        'No se pudo enviar el mensaje. Intenta de nuevo en unos minutos.';
    }
  }

  reintentar() {
    this.estado = 'inactivo';
    this.mensajeError = '';
  }
}
