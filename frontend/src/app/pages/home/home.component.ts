import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../components/hero/hero.component';
import { About } from '../../components/about/about.component';
import { Highlights } from '../../components/highlights/highlights.component';
import { Starline } from '../../components/starline/starline.component';
import { Community } from '../../components/community/community.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    Hero,
    About,
    Highlights,
    Starline,
    Community,
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class Home {
}
