import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-highlights',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './highlights.component.html',
  styleUrl: './highlights.component.css',
})
export class Highlights implements OnInit, OnDestroy {
  libros = [
    {
      titulo: 'El trato: Fuera del campus',
      autor: 'Elle Kennedy',
      recomendacion: 'Una selección especial para disfrutar de un romance y un buen café.',
      imagen: 'img/thedeal.png',
    },
    {
      titulo: 'Orgullo y Prejuicio',
      autor: 'Jane Austen',
      recomendacion: 'Un clásico indispensable. Acompáñalo con nuestro Latte de Vainilla.',
      imagen: 'img/orgulloprejuicio.png',
    },
    {
      titulo: 'Una Corte de Niebla y Furia',
      autor: 'Sarah J. Maas',
      recomendacion: 'Adéntrate a la fantasía con el 2do libro de la saga de ACOTAR',
      imagen: 'img/acotar.png',
    },
  ];

  indiceActual = 0;
  intervalo: any;

  mostrarFormulario = false;
  cargandoInscripcion = false;
  inscripcionExitosa = false;
  nombreUsuario = '';
  emailUsuario = '';

  mesActual = new Date().getMonth();

  ngOnInit() {
    this.iniciarCarrusel();
    window.addEventListener('load', this.configurarTemporada);
  }

  getClasesTarjeta() {
    const base = 'bg-white bg-opacity-60 border-gray-100';
    if (this.mesActual === 7) return 'bg-amber-50 border-amber-200';
    return base;
  }

  ngOnDestroy() {
    this.detenerCarrusel();
    window.removeEventListener('load', this.configurarTemporada);
  }

  configurarTemporada = () => {
    console.log('Sistema de temporada cargado para el mes de Agosto:', this.mesActual);
  };

  iniciarCarrusel() {
    this.intervalo = setInterval(() => {
      this.siguienteLibro();
    }, 5000);
  }
  detenerCarrusel() {
    if (this.intervalo) clearInterval(this.intervalo);
  }
  siguienteLibro() {
    this.indiceActual = (this.indiceActual + 1) % this.libros.length;
  }
  seleccionarLibro(indice: number) {
    this.indiceActual = indice;
    this.detenerCarrusel();
    this.iniciarCarrusel();
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
  }
  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.nombreUsuario = '';
    this.emailUsuario = '';
  }

  enviarFormulario() {
    if (!this.nombreUsuario || !this.emailUsuario) return;
    this.mostrarFormulario = false;
    this.cargandoInscripcion = true;
    setTimeout(() => {
      this.cargandoInscripcion = false;
      this.inscripcionExitosa = true;
    }, 1500);
  }
}