import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClubLectura {
  private apiUrl = 'http://localhost:3000/api/club-lectura';

  constructor(private http: HttpClient) { }

  inscribirUsuario(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inscribir`, datos);
  }
}
