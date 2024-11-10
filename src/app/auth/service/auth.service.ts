import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';

/**
 * Dienst zur Interaktion mit dem Backend-System bezüglich Authentifizierung/Autorisierung
 */

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser = new BehaviorSubject<User>(null);  // aktuell angemeldeter Benutzer (standardmäßig null)
  isLoggedIn = false; // Indikator, ob der Benutzer angemeldet ist oder nicht

  backendAuthURI = environment.backendURL + '/auth'; // Link zur Root-URL des autorisierungsbezogenen Backends

  constructor(
    private httpClient: HttpClient, // um Anfragen an das Backend zu senden
    private router: Router // Navigation

  ) {
  }

  // Authentifizierung
  public login(request: User): Observable<User> { // ajax Anfrage
    return this.httpClient.post<User>(this.backendAuthURI + '/login', request); // request - dies ist der Hauptteil der Anfrage im JSON-Format
  }

  // neue Benutzerregistrierung
  public register(request: User): Observable<any> {
    return this.httpClient.put<any>(this.backendAuthURI + '/register', request);
  }

  // Kontoaktivierung
  public activateAccount(request: string): Observable<boolean> {
    return this.httpClient.post<boolean>(this.backendAuthURI + '/activate-account', request);
  }

  // Senden Sie die E-Mail zur Kontoaktivierung erneut
  public resendActivateEmail(request: string): Observable<any> {
    return this.httpClient.post<any>(this.backendAuthURI + '/resend-activate-email', request);
  }

  // Senden Sie eine E-Mail, um Ihr Passwort zurückzusetzen
  public sendResetPasswordEmail(request: string): Observable<boolean> {
    return this.httpClient.post<boolean>(this.backendAuthURI + '/send-reset-password-email', request);
  }

  // Benutzerpasswort aktualisieren
  public updatePassword(request: string, token: string): Observable<boolean> {

    /*
      Beim Aktualisieren des Passworts ist der Benutzer nicht am System angemeldet und es liegen daher keine Daten über den Benutzer vor.
      Um das Passwort zu aktualisieren, müssen wir daher der ausgehenden Anfrage ein Token hinzufügen, damit das Backend es erkennt
      und die Ausführung der Update-Methode zulässt (ansonsten kommt es zu einem Zugriffsfehler, keine Rechte).
      Der Token hat ein Zeitlimit (wird im Backend festgelegt), wenn der Benutzer es nicht rechtzeitig schafft -
      Sie müssen die Anfrage zum Zurücksetzen des Passworts erneut durchführen.
     */

    const tokenParam = new HttpParams().set('token', token); // Erstellen Sie ein Objekt für die Anforderungsparameter und fügen Sie ein Token hinzu

    // Fügen Sie das Token zu den Parametern hinzu, damit der Interceptor es zur ausgehenden Anfrage hinzufügen kann
    return this.httpClient.post<boolean>(this.backendAuthURI + '/update-password', request, {params: tokenParam});
  }

  // Abmelden
  public logout(): void {

    this.currentUser.next(null); // Setzen Sie den aktuellen Benutzer zurück
    this.isLoggedIn = false; // Zeigt an, dass der Benutzer abgemeldet ist

    // Um ein Cookie mit dem httpOnly-Flag zu löschen, müssen Sie den Server danach fragen, denn Der Client hat keinen Zugriff auf das Cookie
    this.httpClient.post<any>(this.backendAuthURI + '/logout', null).subscribe();

    this.router.navigate(['']); // Gehen Sie zur Seite mit Geschäftsdaten

  }

  // Benutzer-Autologin (falls in JWT-Cookies vorhanden, gibt das Backend den Status 200 und den aktuellen Benutzer zurück)
  public autoLogin(): Observable<User> {
    return this.httpClient.post<User>(this.backendAuthURI + '/auto', null); // wir übermitteln nichts (leerer Körper)
  }

}

/*
  Klassen (Objekte) für Abfragen und deren Ergebnisse, die automatisch in JSON konvertiert werden.
  Dies ist ein Analogon zu Entitätsklassen aus dem Backend-Projekt (in vereinfachter Form).
  Die Felder müssen mit den Backend-Entitätsklassen übereinstimmen!!! (Andernfalls funktioniert das automatische JSON-Verpacken und -Entpacken nicht korrekt.)
*/

// Benutzer - speichert seine Daten
export class User {
  id: number; // Pflichtfeld, der Benutzer wird dadurch identifiziert
  username: string;
  email: string;
  password: string; // nicht vom Server übertragen (nur von Client zu Server, beispielsweise bei der Aktualisierung eines Passworts)
  roles: Array<Role>; // USER, ADMIN, MODERATOR
}

// Benutzerrolle
export class Role {
  name: string;
}
