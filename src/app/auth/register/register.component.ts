import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService, User} from '../service/auth.service';
import {DeviceDetectorService} from 'ngx-device-detector';


/**
 * Neue Benutzerregistrierungsseite.
 */

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form: FormGroup; // Formular mit eingegebenen Daten
  isLoading = false; // ob der Laden gerade läuft (um den Laden-Indikator anzuzeigen/auszublenden)
  error: string; // Fehlertext vom Server (falls vorhanden)
  // wird beim ersten Klick wahr (um Feldfehler nicht sofort anzuzeigen, sondern erst nach dem ersten Versuch)
  firstSubmitted = false;
  isMobile: boolean;// Haben Sie über ein mobiles Gerät auf die Website zugegriffen oder nicht?


  // Umsetzung aller notwendigen Objekte
  constructor(
      private formBuilder: FormBuilder,
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
      username: ['', [Validators.required]], // Validators.required - Überprüfen Sie, ob die Füllung obligatorisch ist
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

  }

  // Verweis auf Formularkomponenten (um den Code zu kürzen, damit nicht jedes Mal this.form.get('') geschrieben werden muss)
  get usernameField(): AbstractControl {
    return this.form.get('username');
  }

  get emailField(): AbstractControl {
    return this.form.get('email');
  }

  get passwordField(): AbstractControl {
    return this.form.get('password');
  }

  get confirmPasswordField(): AbstractControl {
    return this.form.get('confirmPassword');
  }

  // Versuchen Sie, Daten aus dem Registrierungsformular zu übermitteln
  public submitForm(): void {

    this.firstSubmitted = true; // einmal angeklickt, um das Formular abzusenden (Sie können jetzt Fehler anzeigen)

    if (this.form.invalid) { // wenn mindestens ein Fehler in den eingegebenen Formulardaten vorliegt
      return; // Senden Sie keine Daten an den Server
    }
    this.isLoading = true; // Ladeanzeige anzeigen

    // Objekt, das an den Server gesendet werden soll (zum Anfragetext hinzugefügt)
    const user = new User();
    user.username = this.usernameField.value;
    user.email = this.emailField.value;
    user.password = this.passwordField.value;

    // Senden einer Anfrage an den Server
    this.authService.register(user).subscribe(
        () => { // Die Anfrage wurde erfolgreich und ohne Fehler ausgeführt

          this.isLoading = false; // Ladeanzeige ausblenden

          this.error = null; // Wenn auf der Seite zuvor ein Fehler angezeigt wurde, blenden Sie ihn aus

          // Zeigt die Benutzerinformationen auf einer neuen Seite an
          this.router.navigate(['/info-page',{msg: 'An email has been sent to confirm your account. Check your email in 1-2 minutes.'}]);

        },
        err => {
          this.isLoading = false;

          switch (err.error.exception) {
            case 'DataIntegrityViolationException': { // Beim Hinzufügen von Daten ist ein Integritätsfehler aufgetreten (ungültiger Fremdschlüssel).
              this.error = `User or email already exists`;
              break;
            }
            case 'ConstraintViolationException': {  // Beim Hinzufügen von Daten ist ein Fehler bei der Eindeutigkeit der Zeile aufgetreten
              this.error = `User or email already exists`;
              break;
            }
            case 'UserOrEmailAlreadyExistException': {
              this.error = `User or email already exists`;
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


