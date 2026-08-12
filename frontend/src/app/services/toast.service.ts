import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'exito' | 'error' | 'info';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: ToastTipo;
}

let siguienteId = 1;

@Injectable({ providedIn: 'root' })
export class ToastService {
  // Signal con la lista de toasts activos. El ToastContainer solo necesita
  // leer este signal para re-renderizarse automáticamente (aun en modo
  // zoneless), sin que ningún componente tenga que llamar nada manualmente.
  toasts = signal<Toast[]>([]);

  private mostrar(mensaje: string, tipo: ToastTipo, duracionMs = 4000) {
    const id = siguienteId++;
    this.toasts.update((lista) => [...lista, { id, mensaje, tipo }]);

    setTimeout(() => this.cerrar(id), duracionMs);
  }

  exito(mensaje: string) {
    this.mostrar(mensaje, 'exito');
  }

  error(mensaje: string) {
    this.mostrar(mensaje, 'error');
  }

  info(mensaje: string) {
    this.mostrar(mensaje, 'info');
  }

  cerrar(id: number) {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }
}