import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';


/**
 * Interceptor – fängt alle ausgehenden Anfragen ab – Sie können Daten vor dem Senden ändern
 */
@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor() {
  }

// Die Methode wird bei jeder ausgehenden Anfrage an das Backend ausgeführt
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      withCredentials: true // Ermöglichen Sie das Senden von Cookies an das Backend
    });
    console.log(request);

    // Wenn der Benutzer ein neues Passwort eingegeben und an das Backend gesendet hat, fügen wir das Token manuell hinzu
    if (request.url.includes('update-password')) {
      // Wenn die Anforderung darin besteht, das Passwort zu aktualisieren, gibt es ein spezielles Passwort dafür. Token-Verarbeitung

      const token = request.params.get('token'); // Holen Sie sich das Token aus dem Anforderungsparameter
      request.params.delete('token');   // Wir löschen den Parameter, weil er wird nicht mehr benötigt

      request = request.clone({
        setHeaders: ({
          // Fügen Sie dem Authorization-Header ein Token hinzu (wir verwenden kein Cookie,
          // dieses Token wird nur einmal an den Server gesendet, um Ihr Passwort zu aktualisieren)
          Authorization: 'Bearer ' + token
        })
      });
    }

    return next.handle(request); // Senden Sie die ausgehende Anfrage weiter an das Backend
  }
}
