import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-seguimiento-pedido',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-12 max-w-lg">
      <div class="bg-white shadow-xl rounded-2xl p-6 border-t-8 border-verde-epigrafe">
        <h2 class="text-2xl font-bold text-verde-epigrafe text-center mb-2">Seguimiento de tu Pedido</h2>
        <p class="text-gray-500 text-center text-sm mb-6">Sincronizado en tiempo real con mostrador y tu reloj Wear OS</p>

        @if (pedido()) {
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-xl flex justify-between items-center border">
              <div>
                <span class="text-xs text-gray-400 block">Número de orden</span>
                <span class="text-lg font-bold text-gray-800">#{{ pedido().id }}</span>
              </div>
              <div class="text-right">
                <span class="text-xs text-gray-400 block">Total pagado</span>
                <span class="text-lg font-bold text-green-700">\${{ pedido().total }}</span>
              </div>
            </div>

            <div class="p-4 rounded-xl text-center"
                 [class.bg-amber-50]="pedido().estado !== '¡Pedido listo para recoger!'"
                 [class.border-amber-200]="pedido().estado !== '¡Pedido listo para recoger!'"
                 [class.bg-green-50]="pedido().estado === '¡Pedido listo para recoger!'"
                 [class.border-green-200]="pedido().estado === '¡Pedido listo para recoger!'">
              <span class="text-xs uppercase font-bold tracking-wider text-gray-500 block mb-1">Estado actual</span>
              <span class="text-xl font-extrabold"
                    [class.text-amber-700]="pedido().estado !== '¡Pedido listo para recoger!'"
                    [class.text-green-700]="pedido().estado === '¡Pedido listo para recoger!'">
                {{ pedido().estado }}
              </span>
            </div>

            <div class="text-xs text-center text-gray-400 pt-4 border-t">
              Cliente: <span class="font-medium text-gray-600">{{ pedido().nombre_cliente }}</span>
            </div>
          </div>
        } @else {
          <div class="text-center py-10 text-gray-400">
            <p>No tienes ningún pedido activo en este momento.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class SeguimientoPedidoComponent implements OnInit, OnDestroy {
  pedido = signal<any>(null);
  private intervalo: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.obtenerPedido();
    this.intervalo = setInterval(() => this.obtenerPedido(), 6000);
  }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  obtenerPedido() {
    this.http.get<any[]>('https://epigrafe.onrender.com/api/pedidos').subscribe({
      next: (pedidos) => {
        if (pedidos && pedidos.length > 0) {
          this.pedido.set(pedidos[0]);
        }
      }
    });
  }
}
