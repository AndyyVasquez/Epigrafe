import { Routes } from '@angular/router';
import { Home } from './pages/home/home.component';
import { MenuBebidas } from './pages/menu-bebidas/menu-bebidas.component';
import { MenuPostres } from './pages/menu-postres/menu-postres.component';
import { MenuPromociones } from './pages/menu-promociones/menu-promociones.component';
import {Libreria} from './pages/libreria/libreria.component';
import { Terminos } from './pages/terminos/terminos.component';
import { EdicionesMerch } from './pages/ediciones-merch/ediciones-merch.component';
import { Clasicos } from './pages/clasicos/clasicos.component';
import { Catalogo } from './pages/catalogo/catalogo.component';
import { Clublectura } from './pages/clublectura/clublectura.component';
import { Eventos } from './pages/eventos/eventos.component';
import { Beneficios } from './pages/beneficios/beneficios.component';
import { Ubicacion } from './pages/ubicacion/ubicacion.component';
import { Faq } from './pages/faq/faq.component';
import { Facturacion } from './pages/facturacion/facturacion.component';
import { Dashboard } from './admin/dashboard/dashboard.component';
import { EditorLibreria } from './admin/editorlibreria/editorlibreria.component';
import { IniciarSesion } from './pages/iniciar-sesion/iniciar-sesion.component';
import { Registro } from './pages/registro/registro.component';
import { authGuard } from './auth-guard';


export const routes: Routes = [
  { path: '', component: Home }, // La ruta raíz (Inicio)
  { path: 'menu/bebidas', component: MenuBebidas },
  { path: 'menu/postres', component: MenuPostres },
  { path: 'menu/promociones', component: MenuPromociones },
  { path: 'libreria/novedades', component: Libreria },
  { path: 'libreria/clasicos', component: Clasicos },
  { path: 'libreria/ediciones-merch', component: EdicionesMerch },
  { path: 'libreria/catalogo', component: Catalogo },
  { path: 'clublectura', component: Clublectura },
  { path: 'eventos', component: Eventos },
  { path: 'beneficios', component: Beneficios },
  { path: 'contacto/ubicacion', component: Ubicacion },
  { path: 'contacto/faq', component: Faq },
  { path: 'contacto/facturacion', component: Facturacion },
  { path: 'terminos/terminos', component: Terminos },
  { path: 'login', component: IniciarSesion },
  { path: 'registro', component: Registro },
  {
    path: 'admin/dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'editor/catalogo',
    component: EditorLibreria,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Editor'] }
  },
  { path: '**', redirectTo: '' } // Si escriben una URL que no existe, los regresa al inicio
];
