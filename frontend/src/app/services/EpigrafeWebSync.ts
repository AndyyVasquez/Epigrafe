
export interface PedidoSync {
  numeroPedido: number;
  estado: 'En preparación' | 'Listo para recoger' | 'Entregado';
  sucursal: string;
  cliente: string;
}

export class EpigrafeWebSyncService {
  private apiUrl = 'https://epigrafe.onrender.com/api/pedidos';

  async actualizarEstadoPedido(idPedido: number, nuevoEstado: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/${idPedido}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      return response.ok;
    } catch (error) {
      console.error('Error al sincronizar el estado desde la web responsiva:', error);
      return false;
    }
  }
}