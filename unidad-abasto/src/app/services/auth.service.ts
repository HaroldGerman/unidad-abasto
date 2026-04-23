/*import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {}*/
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/usuarios/login';

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    // Esto envía el JSON exacto que probamos en Postman
    return this.http.post(this.apiUrl, { username, password });
  }
}
