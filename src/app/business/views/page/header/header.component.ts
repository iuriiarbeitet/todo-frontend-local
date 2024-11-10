import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {MatDialog} from '@angular/material/dialog';
import {AuthService, User} from '../../../../auth/service/auth.service';
import {SettingsDialogComponent} from '../../dialog/settings-dialog/settings-dialog.component';
import {DialogAction} from '../../../object/DialogResult';
import {IntroService} from '../../../intro/intro.service';
import {Priority} from '../../../model/Priority';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

/*
    "presentational component": zeigt die empfangenen Daten an und sendet alle Aktionen an den Handler
    Zweck – Arbeiten mit Menüs und anderen Daten oben auf der Seite.
    Die Klasse sieht den dataHandler nicht, weil sollte nicht direkt damit funktionieren
 */
export class HeaderComponent implements OnInit {

  // ----------------------- eingehende Parameter ----------------------------

  @Input()
  categoryName: string; // aktuell ausgewählte Kategorie zur Anzeige

  @Input()
  user: User; // Benutzer, seinen Namen anzuzeigen

  @Input()
  showStat: boolean;

  @Input()
  showMobileSearch: boolean;


  // ----------------------- ausgehende Aktionen ----------------------------

  @Output()
  toggleMenuEvent = new EventEmitter(); // Menü ein-/ausblenden

  @Output()
  toggleStatEvent = new EventEmitter<boolean>(); // Statistiken ein-/ausblenden

  @Output()
  settingsChangedEvent = new EventEmitter<Priority[]>();

  @Output()
  toggleMobileSearchEvent = new EventEmitter<boolean>(); // Suche ein-/ausblenden (für mobile Geräte)

  isMobile: boolean; // Haben Sie über ein mobiles Gerät auf die Website zugegriffen oder nicht?

  constructor(
    private dialogBuilder: MatDialog, // um Dialogfelder anzuzeigen
    private deviceService: DeviceDetectorService, // um das Gerät des Benutzers zu ermitteln
    private auth: AuthService,
    private introService: IntroService, // Hilfe-Service – Bereiche mit Hinweisen werden hervorgehoben

  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
  }

  // Linkes Menü mit Kategorien ein-/ausblenden
  onToggleMenu(): void {
    this.toggleMenuEvent.emit(); // Menü ein-/ausblenden
  }

  // Statistiken ein-/ausblenden
  onToggleStat(): void {
    this.toggleStatEvent.emit(!this.showStat);
  }

  logout(): void {
    this.auth.logout(); // Sie müssen den Dienst (Backend) aufrufen, um sich abzumelden
  }

  // Einstellungsfenster
  showSettings(): void {
    const dialogRef = this.dialogBuilder.open(SettingsDialogComponent,
      {
        autoFocus: false,
        width: '600px',
        minHeight: '300px',
        data: [this.user],
        maxHeight: '90vh' // wird 90 % der Bildschirmhöhe einnehmen

      },
    );

    dialogRef.afterClosed().subscribe(result => {

      if (result && result.action === DialogAction.SETTINGS_CHANGE) {
        this.settingsChangedEvent.emit(result.obj);
        return;
      }
    });
  }

  // Suchwerkzeuge ein-/ausblenden
  onToggleMobileSearch(): void {
    this.toggleMobileSearchEvent.emit(!this.showMobileSearch);
  }

  // Erste Schritte, Einführung (intro)
  showIntroHelp(): void {
    this.introService.startIntroJS();
  }
}
