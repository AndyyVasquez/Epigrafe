import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-seguimiento-pedido',
  template: `
    <div class="container text-center mt-5">
      <div class="card shadow p-4 mx-auto" style="max-width: 500px; border-top: 5px solid #3B4D36;">
        <h3 class="text-success fw-bold">Seguimiento de tu Pedido</h3>
        <hr>
        <div *ngIf="pedidoActivo; else sinPedido">
          <h4 class="text-dark">Pedido #{{ pedidoActivo.id }}</h4>
          <p class="text-muted">Cliente: {{ pedidoActivo.nombre_cliente }}</p>

          <div class="alert alert-warning fw-bold mt-3">
            Estado: {{ pedidoActivo.estado }}
          </div>

          <p class="small text-secondary mt-3">Te estamos notificando también en tiempo real en tu reloj Wear OS.</p>
        </div>
        <ng-template #sinPedido>
          <p class="text-muted">No tienes ningún pedido activo en este momento.</p>
        </ng-template>
      </div>
    </div>
  `
})
export class SeguimientoPedidoComponent implements OnInit, OnDestroy {
  pedidoActivo: any = null;
  private intervalo: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.consultarUltimoPedido();
    this.intervalo = setInterval(() => this.consultarUltimoPedido(), 8000); // Polling cada 8s
  }

  ngOnDestroy(): void {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  consultarUltimoPedido() {
    // Tomamos el usuario logueado o el último pedido reciente de la API pública
    this.http.get<any[]>('https://epigrafe.onrender.com/api/pedidos').subscribe(
      pedidos => {
        if (pedidos && pedidos.length > 0) {
          // Filtramos o tomamos el más reciente del usuario
          this.pedidoActivo = pedidos[0];
        }
      },
      err => console.error('Error consultando pedido', err)
    );
  }
}
