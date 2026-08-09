import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-starline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './starline.component.html',
})
export class Starline implements OnInit {
  animarBebida = true;

  // Variables dinámicas para el banner
  periodoActual = 'mañana';
  titulo = '';
  subtitulo = '';
  textoBoton = '';

  ngOnInit() {
    // 1. Configuramos los textos y colores según la hora apenas carga el componente
    this.configurarBannerPorHora();

    // 2. Ejecutamos tu animación de entrada (a los 5 segundos)
    setTimeout(() => {
      this.animarBebida = false;
    }, 5000);
  }

  configurarBannerPorHora() {
    const hora = new Date().getHours(); // Obtiene la hora actual (0 a 23)

    if (hora >= 6 && hora < 12) {
      this.periodoActual = 'mañana';
      this.titulo = 'Latte de Especialidad';
      this.subtitulo = 'El equilibrio perfecto para despertar y acompañar tu lectura matutina.';
      this.textoBoton = 'Ordena tu bebida';
    }
  else if (hora >= 12 && hora < 19) {
      this.periodoActual = 'tarde';
      this.titulo = 'Cold Brew';
      this.subtitulo = 'Refresca tu tarde y tu lectura con nuestro delicioso Cold Brew.';
      this.textoBoton = 'Pruébalo ahora';
    }
    else {
      this.periodoActual = 'noche';
      this.titulo = 'Infusión Relajante';
      this.subtitulo = 'Notas de manzanilla y lavanda para cerrar tu día con una buena historia.';
      this.textoBoton = 'Pide tu infusión';
    }
  }
}
