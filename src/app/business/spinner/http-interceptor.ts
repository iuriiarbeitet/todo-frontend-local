import {BehaviorSubject, Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {SpinnerService} from './spinner.service';


@Injectable()
// fängt alle HTTP-Anfragen ab, um den Lade-Spinner anzuzeigen
export class ShowSpinnerInterceptor implements HttpInterceptor {

    constructor(private spinnerService: SpinnerService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        this.spinnerService.show();

        return next
            .handle(req)
            .pipe(
                tap((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        this.spinnerService.hide(); // Wenn die Anfrage abgeschlossen ist, entfernen Sie den Spinner
                    }
                }, (error) => {
                    console.log(error);
                    this.spinnerService.hide(); // Wenn ein Fehler auftritt, entfernen Sie den Spinner
                })
            );
    }
}



