import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../service/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';


@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css']
})
export class UpdatePasswordComponent implements OnInit {

  form: FormGroup; // Formular mit Benutzereingaben
  isLoading = false; // ob der Laden gerade läuft (um den Laden-Indikator anzuzeigen/auszublenden)
  error: string; // Fehlertext vom Server (falls vorhanden)
  showPasswordForm = false; // ob das Formular mit Passwörtern angezeigt werden soll
  token: string; // Token zum Senden einer Anfrage an den Server
  firstSubmitted = false; // wird beim ersten Klick wahr (damit Feldfehler nicht sofort, sondern erst nach dem ersten Versuch angezeigt werden)
  isMobile: boolean; // Haben Sie über ein mobiles Gerät auf die Website zugegriffen oder nicht?


  // Umsetzung aller notwendigen Objekte
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private deviceService: DeviceDetectorService, // um den Gerätetyp zu bestimmen
  ) {
  }

  ngOnInit(): void { // Wird aufgerufen, wenn die Komponente initialisiert wird (bevor das Erscheinungsbild gerendert wird)

    this.isMobile = this.deviceService.isMobile();

    // Initialisieren des Formulars mit den erforderlichen Feldern, Anfangswerten und Validatoren
    this.form = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.route.params.subscribe(params => { // Weil params ist ein Observable – wir abonnieren und erhalten die Werte
      this.token = params.token; // Lesen Sie das Token aus dem Routenparameter
      this.showPasswordForm = true; // Zeigen Sie das Formular mit Passwörtern erst an, nachdem Sie das Token vom Anforderungsparameter erhalten haben
    });

  }

  // Verweis auf Formularkomponenten (um den Code zu kürzen, damit nicht jedes Mal this.form.get('') geschrieben werden muss)
  get passwordField(): AbstractControl  {
    return this.form.get('password');
  }

  get confirmPasswordField(): AbstractControl  {
    return this.form.get('confirmPassword');
  }

  // Versuchen Sie, Formulardaten zu übermitteln
  public submitForm(): void {

    this.firstSubmitted = true; // einmal angeklickt, um das Formular abzusenden (Sie können jetzt Fehler anzeigen)

    if (this.form.invalid) { // wenn mindestens ein Fehler in den eingegebenen Formulardaten vorliegt
      return; // Senden Sie keine Daten an den Server
    }

    this.isLoading = true; // Ladeanzeige anzeigen

    // Senden einer Anfrage an den Server
    this.authService.updatePassword(this.passwordField.value, this.token).subscribe(
      result => { // Die Anfrage wurde erfolgreich und ohne Fehler ausgeführt

        this.isLoading = false; // Ladeanzeige ausblenden

        if (result) {
          this.router.navigate(['/info-page', {msg: 'Password updated successfully.'}]);
        }
      },

      () => { // Es ist ein Fehler vom Server aufgetreten
        this.isLoading = false; // Ladeanzeige ausblendenи

        // Zeigt die Benutzerinformationen auf einer neuen Seite an
        this.router.navigate(['/info-page', {msg: 'Error updating password. The page may have expired. Request password again.'}]);

      });
  }
}
