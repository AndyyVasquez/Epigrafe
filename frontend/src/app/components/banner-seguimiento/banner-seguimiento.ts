import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-banner-seguimiento',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (pedidoActivo()) {
      <div class="bg-verde-epigrafe text-white px-4 py-2 text-xs md:text-sm shadow-md flex justify-between items-center transition-all duration-300 border-b border-amber-400">
        <div class="flex items-center gap-2 mx-auto">
          <span class="animate-ping h-2 w-2 rounded-full bg-amber-400 inline-block"></span>
          <span class="font-bold">Tu pedido #{{ pedidoActivo().id }}:</span>
          <span class="underline font-semibold text-amber-300">{{ pedidoActivo().estado }}</span>
        </div>
        <a routerLink="/mi-pedido" class="bg-white text-verde-epigrafe px-3 py-1 rounded font-bold text-xs hover:bg-gray-100 transition">
          Ver detalles
        </a>
      </div>
    }
  `
})
export class BannerSeguimientoComponent implements OnInit, OnDestroy {
  pedidoActivo = signal<any>(null);
  private intervalo: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.verificarPedido();
    this.intervalo = setInterval(() => this.verificarPedido(), 8000);
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  verificarPedido() {
    this.http.get<any[]>('https://epigrafe.onrender.com/api/pedidos').subscribe({
      next: (pedidos) => {
        if (pedidos && pedidos.length > 0) {
          // Tomamos el último pedido registrado y filtramos si no está entregado
          const ultimo = pedidos[0];
          if (ultimo.estado !== 'Entregado') {
            this.pedidoActivo.set(ultimo);
          } else {
            this.pedidoActivo.set(null);
          }
        }
      },
      error: () => {}
    });
  }
}
