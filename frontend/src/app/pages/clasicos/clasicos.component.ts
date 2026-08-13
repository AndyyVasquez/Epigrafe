import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clasicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clasicos.component.html'
})
export class Clasicos {
  clasicos = [
    { 
      titulo: 'Orgullo y Prejuicio', 
      autor: 'Jane Austen', 
      descripcion: 'Una crítica magistral a las costumbres sociales de la Inglaterra del siglo XIX.', 
      detallesExtensos: 'Publicada en 1813, esta obra maestra explora la relación entre Elizabeth Bennet y Fitzwilliam Darcy. A través de una ironía fina y personajes inolvidables, Jane Austen examina cómo los prejuicios iniciales y el orgulo mal entendido nublan el juicio humano antes de dar paso al verdadero amor y la madurez personal.',
      imagen: '/img/orgulloprejuicio.png',
      activo: false 
    },
    { 
      titulo: 'Cien Años de Soledad', 
      autor: 'Gabriel García Márquez', 
      descripcion: 'La obra cumbre del realismo mágico latinoamericano.', 
      detallesExtensos: 'La historia de la estirpe de los Buendía en el pueblo mítico de Macondo. Es un espejo de la historia latinoamericana donde lo fantástico y lo cotidiano conviven con absoluta naturalidad, abordando temas como el destino, la memoria y la soledad cíclica.',
      imagen: '/img/libro-cien.png',
      activo: false 
    },
    { 
      titulo: 'El Retrato de Dorian Gray', 
      autor: 'Oscar Wilde', 
      descripcion: 'Una reflexión profunda sobre la vanidad y la moralidad.', 
      detallesExtensos: 'La única novela de Oscar Wilde examina la obsesión por la eterna juventud y la belleza estética. A medida que Dorian lleva una vida de excesos y crueldad, su rostro permanece intacto mientras su retrato en el desván absorbe la podredumbre de su alma.',
      imagen: '/img/libro-dorian.png',
      activo: false 
    }
  ];

  toggleLeerMas(libro: any) {
    libro.activo = !libro.activo;
  }
}