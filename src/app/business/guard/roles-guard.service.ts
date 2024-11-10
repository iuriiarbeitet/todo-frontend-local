import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {AuthService} from '../../auth/service/auth.service';


/*
Eine spezielle Interceptor-Klasse, wenn eine Route ausgeführt wird
Route („Route“) ist ein Übergang zu einem beliebigen Link, der im AppRoutingModule in der Routes-Konstante beschrieben ist.
Für alle Routen, bei denen diese Klasse angegeben ist, wird bei der Navigation per URI zuerst die Methode canActivate aufgerufen.
was den Übergang erlaubt oder verweigert.
Dieser Wächter wird erstellt, um anhand der Rollen des Benutzers zu überprüfen, ob er diese Seite aufrufen kann.
Dokumentation: https://angular.io/guide/router
 */


@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {

  constructor(
    private authService: AuthService, // Authentifizierungsdienst
    private router: Router// zur Navigation, Weiterleitung zu anderen Seiten
  ) {
  }

  /*
    Die Methode wird automatisch aufgerufen, wenn über einen mit einer Route verknüpften URI navigiert wird
    (sofern für diese Route eine bestimmte Klasse angegeben ist).
    Gibt true zurück – der Übergang wird ausgeführt, false – der Übergang ist verboten.
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isLoggedIn) { // wenn der Benutzer bereits angemeldet ist,
      // wenn der Benutzer Rechte für diese Seite hat, wird „true“ zurückgegeben und es findet ein Übergang zur angeforderten URL statt
      return this.userHasRequiredRole(this.authService.currentUser.getValue().roles, next.data.allowedRoles);
    }

    /*
    Versucht, eine automatische Authentifizierung durchzuführen.
    Wenn ein JWT-Cookie im Browser gespeichert wurde, wird es an das Backend gesendet und der Benutzer meldet sich automatisch an
    eine Anfrage senden, um den Benutzer abzurufen (da der Benutzer nicht lokal gespeichert ist, ist dies unsicher).
    Jedes Mal, wenn die Seite aktualisiert wird, müssen Sie den Benutzer erneut vom Backend abrufen
     */
    return this.authService.autoLogin().pipe( // Verwechseln Sie nicht Pipe von Angular und Pipe von RXJS
      map(result => {
        if (result) {

          const user = result; // Holen Sie sich den Benutzer von JSON

          // Wir speichern den Benutzer im Dienst, damit wir ihn dann von dort abrufen können
          this.authService.currentUser.next(user);

          // Indikator dafür, dass sich der Benutzer erfolgreich angemeldet hat
          this.authService.isLoggedIn = true;

          // Wenn der Benutzer Rechte für diese Seite hat, wird „true“ zurückgegeben und es findet ein Übergang zur angeforderten URL statt
          return this.userHasRequiredRole(user.roles, next.data.allowedRoles);

        } else { // Wenn der Benutzer nicht autorisiert ist, leiten Sie ihn zur Hauptseite weiter.
          this.router.navigateByUrl(''); // Site-Root (Homepage)
          return false; // Folgen Sie nicht der angeforderten URL
        }
      }),
      catchError((err) => {
        console.log(err);

        this.router.navigateByUrl('');
        return of(false);
      })
    );


  }

  /*
    prüft die Schnittmenge von Rollen aus 2 Listen
    userRoles – Benutzerrollen
    erlaubte Rollen (allowedRoles) – Rollen für den Zugriff auf den URI
   */
  private userHasRequiredRole(userRoles: Array<any>, allowedRoles: Array<string>): boolean {

    for (const r of allowedRoles) {
      if (userRoles.find(e => e.name === r)) {
        return true; // wenn mindestens einer einen Datensatz gefunden hat, der übereinstimmt
      }
    }

    this.router.navigate(['/access-denied']); // Wenn kein Zugriff besteht, senden wir an die Seite access-denied
    return false; // нужная роль не найдена
  }

}
