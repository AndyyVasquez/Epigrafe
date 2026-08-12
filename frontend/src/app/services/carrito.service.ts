import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Carrito{
  private apiUrl = 'https://epigrafe.onrender.com/api/pedidos'; 

  constructor(private http: HttpClient) {}

  obtenerCarrito() {
    return JSON.parse(localStorage.getItem('carrito_pickup') || '[]');
  }

  agregarAlCarrito(producto: any) {
    const carrito = this.obtenerCarrito();
    carrito.push(producto);
    localStorage.setItem('carrito_pickup', JSON.stringify(carrito));
  }

  vaciarCarrito() {
    localStorage.removeItem('carrito_pickup');
  }

  enviarPedido(datosPedido: any): Observable<any> {
    return this.http.post(this.apiUrl, datosPedido);
  }
}