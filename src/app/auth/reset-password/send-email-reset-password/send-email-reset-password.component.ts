import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../service/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';


@Component({
  selector: 'app-send-email-reset-password',
  templateUrl: './send-email-reset-password.component.html',
  styleUrls: ['./send-email-reset-password.component.css']
})
export class SendEmailResetPasswordComponent implements OnInit {

  form: FormGroup; // Formular mit Benutzereingaben
  isLoading = false; // ob der Laden gerade läuft (um den Laden-Indikator anzuzeigen/auszublenden)
  error: string; // Fehlertext vom Server (falls vorhanden)
  firstSubmitted = false; // wird beim ersten Klick wahr (damit Feldfehler nicht sofort, sondern erst nach dem ersten Versuch angezeigt werden)
  isMobile: boolean; // Haben Sie über ein mobiles Gerät auf die Website zugegriffen oder nicht?

  // Umsetzung aller notwendigen Objekte
  constructor(
    private formBuilder: FormBuilder, // um ein Formular zu erstellen
    private route: ActivatedRoute, // aktuelle Route, wohin Sie bereits gegangen sind (Sie können Daten, zum Beispiel Parameter, ablesen)
    private router: Router, // zur Navigation, Weiterleitung zu anderen Seiten
    private authService: AuthService, // Authentifizierungsdienst
    private deviceService: DeviceDetectorService, // um den Gerätetyp zu bestimmen

  ) {
  }

  ngOnInit(): void { // Wird aufgerufen, wenn die Komponente initialisiert wird (bevor das Erscheinungsbild gerendert wird)

    this.isMobile = this.deviceService.isMobile();

    // Initialisieren des Formulars mit den erforderlichen Feldern, Anfangswerten und Validatoren
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Verweis auf die Formularkomponente (um den Code zu kürzen, damit nicht jedes Mal this.form.get('') geschrieben werden muss)
  get emailField(): AbstractControl {
    return this.form.get('email');
  }

  // Versuchen Sie, Formulardaten zu übermitteln
  public submitForm(): void {

    this.firstSubmitted = true; // einmal angeklickt, um das Formular abzusenden (jetzt können Sie Fehler anzeigen)

    if (this.form.invalid) { // wenn mindestens ein Fehler in den eingegebenen Formulardaten vorliegt
      return; // не отправляем данные на сервер
    }
    this.isLoading = true; // Ladeanzeige anzeigen

    // отправка запроса на сервер
    this.authService.sendResetPasswordEmail(this.emailField.value).subscribe(
      () => { // Die Anfrage wurde erfolgreich und ohne Fehler ausgeführt

        this.isLoading = false;

        // Zeigt die Benutzerinformationen auf einer neuen Seite an
        this.router.navigate(['/info-page', {msg: 'You have been sent a letter to reset your password, check your email in 1-2 minutes.'}]);
      },

      err => {
        this.isLoading = false;

        switch (err.error.exception) { // Wir lesen den Fehlertyp aus, um richtig reagieren zu können
          case 'UsernameNotFoundException': { // Benutzer oder E-Mail wurde nicht gefunden
            this.error = `There is no user registered with this email address.`;
            break;
          }
          default: {
            this.error = `Error`;
            break;
          }
        }
      });

  }
}
