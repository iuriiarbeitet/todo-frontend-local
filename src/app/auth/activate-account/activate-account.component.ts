import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../service/auth.service';
import {DeviceDetectorService} from 'ngx-device-detector';


/**
 * Die Seite, auf der Ihr Konto aktiviert wird, wenn Sie darauf zugreifen.
 * Der Nutzer öffnet diese Seite über einen Link aus dem Brief – dementsprechend muss umgehend eine Aktivierungsanfrage
 * an den Server gesendet werden.
 */

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent implements OnInit {

  showResendLink = false; // Zeigt einen Link zum erneuten Versenden der Aktivierungs-E-Mail an
  uuid: string; // uuid Benutzer, um es zu aktivieren
  isLoading = false; // ob der Laden gerade läuft (um den Laden-Indikator anzuzeigen/auszublenden)
  error: string; // Fehlertext vom Server (falls vorhanden)
  firstSubmitted = false; // wird beim ersten Klick wahr (damit Feldfehler nicht sofort, sondern erst nach dem ersten Versuch angezeigt werden)
  form: FormGroup; // Formular mit Benutzereingaben
  isMobile: boolean; // Haben Sie über ein mobiles Gerät auf die Website zugegriffen oder nicht?


  // Umsetzung aller notwendigen Objekte
  constructor(
    private formBuilder: FormBuilder, // um ein Formular zu erstellen
    private route: ActivatedRoute, // aktuelle Route, wohin Sie bereits gegangen sind (Sie können Daten, zum Beispiel Parameter, ablesen)
    private authService: AuthService, // Authentifizierungsdienst
    private router: Router, // zur Navigation, Weiterleitung zu anderen Seiten
    private deviceService: DeviceDetectorService // um das Gerät zu identifizieren
  ) {
  }

  ngOnInit(): void {

    this.isMobile = this.deviceService.isMobile();

    // Initialisieren des Formulars mit den erforderlichen Feldern, Anfangswerten und Validatoren
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Wenn die Seite geladen wird, senden wir sofort eine Anfrage zur Aktivierung des Benutzers
    this.route.params.subscribe(params => {
      this.uuid = params.uuid;

      if (this.uuid === 'error') {
        this.showResendLink = true;
        return;
      }
      this.isLoading = true; // Ladeanzeige anzeigen

      // Senden einer Anfrage an den Server
      this.authService.activateAccount(this.uuid).subscribe(
        result => {

          this.isLoading = false;

          if (result) {
            // Zeigt die Benutzerinformationen auf einer neuen Seite an
            this.router.navigate(['/info-page', {msg: 'Your account has been successfully activated.'}]);
          } else {
            //  false - etwas ist schief gelaufen
            this.router.navigate(['/info-page', {msg: 'Your account is not activated. Try again.'}]);
          }

        }
        ,
        err => {

          this.isLoading = false;

          switch (err.error.exception) {
            case 'UserAlreadyActivatedException': {
              this.router.navigate(['/info-page', {msg: 'Your account has already been activated previously.'}]);
              break;
            }
            default: {
              this.error = `Activation error. Try sending yourself the email again.`;
              this.showResendLink = true;
              break;
            }
          }
        }
      );
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
      return;
    }

    this.isLoading = true;

    // Senden einer Anfrage an den Server
    this.authService.resendActivateEmail(this.emailField.value).subscribe(
      () => {

        this.isLoading = false;

        this.router.navigate(['/info-page', {msg: 'An activation email has been sent to you.'}]);
      },
      err => {

        this.isLoading = false;

        switch (err.error.exception) {

          case 'UserAlreadyActivatedException': {
            this.router.navigate(['/info-page', {msg: 'Your account has already been activated previously.'}]);
            break;
          }
          case 'UsernameNotFoundException': {
            this.error = 'User with this email not found';
            break;
          }
          default: {
            this.error = `Error`;
            break;
          }
        }
      }
    );
  }
}

