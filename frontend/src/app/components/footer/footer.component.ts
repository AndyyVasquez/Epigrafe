import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideMapPin } from '@ng-icons/lucide';
import { tablerBrandTiktok, tablerBrandInstagram, tablerPhone } from '@ng-icons/tabler-icons';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NgIconComponent, RouterLink, RouterLinkActive],
  providers: [
    provideIcons({
      lucideMapPin,
      tablerPhone,
      tablerBrandInstagram,
      tablerBrandTiktok
    })
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class Footer {
  mostrarModal = false;
  abrirModalPrivacidad() {
    this.mostrarModal = true;
  }
}
