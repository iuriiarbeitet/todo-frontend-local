import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';

/**
 * Seite zur Anzeige von Textinformationen (Status).
 * Meistens ist es das Ergebnis einer Benutzeroperation.
 */

@Component({
  selector: 'app-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.css']
})
export class InfoPageComponent implements OnInit {

  msg: string; // Text, der auf der Seite angezeigt werden soll
  isMobile: boolean; // Haben Sie über ein mobiles Gerät auf die Website zugegriffen oder nicht?


  // Umsetzung aller notwendigen Objekte
  constructor(
    private route: ActivatedRoute, // aktuelle Route, wohin Sie bereits gegangen sind (Sie können Daten, zum Beispiel Parameter, ablesen)
    private deviceService: DeviceDetectorService // Von welchem Gerät aus haben Sie sich angemeldet?

  ) {
  }

  ngOnInit(): void { // Wird aufgerufen, wenn die Komponente initialisiert wird (bevor das Erscheinungsbild gerendert wird)

    this.isMobile = this.deviceService.isMobile();

    // Wir lesen den übergebenen Text aus dem Parameter, um ihn auf der Seite anzuzeigen
    this.route.params.subscribe(params => {
      this.msg = params.msg;
    });

  }

}
