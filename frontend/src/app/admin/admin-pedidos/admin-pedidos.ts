import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-pedidos',
  templateUrl: './admin-pedidos.html',
  styleUrls: ['./admin-pedidos.css']
})
export class AdminPedidosComponent implements OnInit {
  pedidos: any[] = [];
  apiUrl = 'https://epigrafe.onrender.com/api/pedidos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarPedidos();
    // Auto-refrescar cada 10 segundos para mantener el panel en tiempo real
    setInterval(() => this.cargarPedidos(), 10000);
  }

  cargarPedidos() {
    this.http.get<any[]>(this.apiUrl).subscribe(
      data => this.pedidos = data,
      err => console.error('Error al cargar pedidos', err)
    );
  }

  actualizarEstado(id: number, nuevoEstado: string) {
    this.http.patch(`${this.apiUrl}/${id}/estado`, { estado: nuevoEstado }).subscribe(
      () => {
        console.log('Estado actualizado');
        this.cargarPedidos();
      },
      err => console.error('Error al actualizar estado', err)
    );
  }
}
