import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService, User} from '../service/auth.service';
import {Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup; // Formular mit Benutzereingaben
  user: User; // Benutzerdaten nach erfolgreicher Anmeldung
  error: string; // Fehlertext (falls vorhanden) – vom Backend zurückgegeben
  // wird beim ersten Klick wahr (damit Feldfehler nicht sofort angezeigt werden, sondern erst nach dem Klicken auf die Eingabetaste)
  firstSubmitted = false;
  isLoading = false; // ob der Laden gerade läuft (um den Laden-Indikator anzuzeigen/auszublenden)
  showResendLink = false; // Sie können einen Link zum erneuten Versenden des Aktivierungsschreibens anzeigen oder nicht
  isMobile: boolean; // Haben Sie über ein mobiles Gerät auf die Website zugegriffen oder nicht?


  // Umsetzung aller notwendigen Objekte
  constructor(
    private formBuilder: FormBuilder, // um ein Formular zu erstellen
    private authService: AuthService, // Authentifizierungsdienst
    private router: Router, // zur Navigation, Weiterleitung zu anderen Seiten
    private deviceService: DeviceDetectorService, // um den Gerätetyp zu bestimmen
  ) {
  }

  // Wird automatisch aufgerufen, wenn die Anmeldekomponente erstellt wird
  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();

    // Initialisieren des Formulars mit den erforderlichen Feldern, Anfangswerten und Validatoren
    this.form = this.formBuilder.group({
        username: ['', [Validators.required, Validators.minLength(6)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      }
    );
  }

  // schneller Zugriff auf Formularkomponenten (um den Code zu kürzen, damit nicht jedes Mal this.form.get('') geschrieben werden muss)
  get usernameField(): AbstractControl {
    return this.form.get('username');
  }

  get passwordField(): AbstractControl {
    return this.form.get('password');
  }
  // Versuchen Sie, Authentifizierungsformulardaten zu übermitteln
  public submitForm(): void {

    this.firstSubmitted = true; // einmal angeklickt, um das Formular abzusenden (Sie können jetzt Fehler anzeigen)

    if (this.form.invalid) { // wenn mindestens ein Fehler in den eingegebenen Formulardaten vorliegt
      return; // Wir senden keine Daten an den Server
    }
    this.isLoading = true; // Zeigt die Ladeanzeige an

    // Objekt, das an den Server gesendet werden soll (zum Anfragetext hinzugefügt)
    const tmpUser = new User();
    tmpUser.username = this.usernameField.value; // Nimm den vom Benutzer eingegebenen Wert
    tmpUser.password = this.passwordField.value;

    // Senden einer Anfrage an den Server
    this.authService.login(tmpUser).subscribe( // Abonnieren Sie das Ergebnis der Backend-Arbeit
      result => { // Die Anfrage wurde erfolgreich und ohne Fehler abgeschlossen (das bedeutet,
        // dass der Benutzer einen falschen Benutzernamen und ein falsches Passwort eingegeben hat).
        this.isLoading = false;
        /**
         * Das Passwort wird bei der Authentifizierung nur einmal übermittelt und nicht in jwt gespeichert.
         * Bei jeder erfolgreichen Authentifizierung wird im Backend ein neues JWT generiert
         * Notiz:
         * Die Benutzerdaten befinden sich nicht im JWT (Nutzlast), sondern einfach als Teil des JSON (nicht des codierten Benutzerfelds).
         * Innerhalb von jwt haben wir nur den Benutzernamen und andere Systemwerte nach Bedarf (Ablauf usw.).
         */
        this.user = result; // Rufen Sie den Benutzer aus JSON ab und speichern Sie ihn im Anwendungsspeicher (in einer Variablen).
        // Wir speichern den Benutzer im Dienst, sodass von überall auf die Variable zugegriffen werden kann
        // und Benutzerdaten empfangen werden können
        this.authService.currentUser.next(this.user);
        this.authService.isLoggedIn = true; // Indikator dafür, dass sich der Benutzer erfolgreich angemeldet hat
        this.router.navigate(['main']); // Gehen Sie zur Seite mit Geschäftsdaten
      },
      err => {
        this.isLoading = false;
        switch (err.error.exception) {// Den Fehlertyp lesen, um richtig zu reagieren
          case 'BadCredentialsException': { // Der Benutzer hat das Anmeldekennwort falsch eingegeben
            this.error = `Error: check your login or password.`;
            break;
          }
          // Der Benutzer hat das Login-Passwort korrekt eingegeben, sein Benutzer wurde jedoch noch nicht aktiviert
          case 'DisabledException': {
            this.error = `User not activated`;
            this.showResendLink = true; // Zeigt einen Link zum erneuten Versenden der Aktivierung E-Mail an
            break;
          }
          default: {
            this.error = `Error (please contact your administrator)`;
            break;
          }
        }
      }
    );
  }
}
