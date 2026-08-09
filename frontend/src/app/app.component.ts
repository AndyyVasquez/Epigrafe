import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // ¡Volvió!
import { Navbar } from './components/navbar/navbar.component';
import { Footer } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'epigrafe-frontend';
}
