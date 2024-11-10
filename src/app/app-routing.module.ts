import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {InfoPageComponent} from './auth/info-page/info-page.component';
import {ActivateAccountComponent} from './auth/activate-account/activate-account.component';
import {SendEmailResetPasswordComponent} from './auth/reset-password/send-email-reset-password/send-email-reset-password.component';
import {UpdatePasswordComponent} from './auth/reset-password/update-password/update-password.component';
import {MainComponent} from './business/views/page/main/main.component';
import {AccessDeniedComponent} from './auth/acces-denied/acces-denied.component';
import {RolesGuard} from './business/guard/roles-guard.service';



// Liste aller Routen und zugehörigen Komponenten (Mapping)
const routes: Routes = [

  // Seiten für nicht autorisierte Benutzer
  {path: '', component: LoginComponent},
  {path: 'logout', redirectTo: '', pathMatch: 'full'},
  {path: 'index', redirectTo: '', pathMatch: 'full'},

  {path: 'register', component: RegisterComponent}, // neue Benutzerregistrierung
  {path: 'reset-password', component: SendEmailResetPasswordComponent}, // Einen Brief senden - Passwortwiederherstellung
  {path: 'info-page', component: InfoPageComponent}, // ein Brief wurde an Sie gesendet

/*
    Seiten für autorisierte Benutzer – zum Öffnen der Seite (und zum Empfangen von RESTful-Daten) ist eine Rollenüberprüfung erforderlich.
     Hier müssen Sie alle Optionen für Ordner/Seiten mit Zugriff durch Rollen beschreiben.
     Alle anderen Links werden auf eine 404-Seite weitergeleitet
 */
  {
    /*
      Vor der Durchführung dieses Routings wird jedes Mal ein spezielles RolesGuard-Objekt aufgerufen.
      RolesGuard liest Benutzerrollen und vergleicht sie mit erlaubten Rollen
     */
    path: 'main', component: MainComponent, canActivate: [RolesGuard], // при переходе по ссылке - сначала отработает RolesGuard
    data: {
      allowedRoles: ['ADMIN', 'USER'] // для открытия этой страницы - у пользователя должна быть одна из этих ролей
    }
  },

  {path: 'activate-account/:uuid', component: ActivateAccountComponent}, // Anfrage für ein Kontoaktivierungsschreiben
  {path: 'update-password/:token', component: UpdatePasswordComponent}, // Anfrage zur Passwortaktualisierung

  {path: 'access-denied', component: AccessDeniedComponent}, // Seite „Zugriff verweigert“.(verboten)

  {path: '**', redirectTo: '/'}, // Senden Sie alle anderen Anfragen an die Hauptseite

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes) // funktioniert ohne dies nicht - importiert das Systemmodul
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
