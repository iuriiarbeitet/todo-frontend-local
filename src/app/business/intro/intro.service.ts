import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as introJs from 'intro.js';


@Injectable({
    providedIn: 'root'
})

// Klasse für die Arbeit mit Intro (Auswahl von Seitenbereichen und deren Beschreibung)
export class IntroService {

    introJS = introJs(); // Objekt zum Arbeiten mit intro

    constructor(
        private translate: TranslateService // Lokalisierung
    ) {

    }

    // Intro (Hilfe) mit hervorgehobenen Elementen anzeigen
    public startIntroJS(): void {

        this.introJS.setOptions(
            {
                nextLabel: this.translate.instant('HELP.NEXT') + ' >',
                prevLabel: '< ' + this.translate.instant('HELP.PREV'),
                doneLabel: this.translate.instant('HELP.EXIT'),
                skipLabel: this.translate.instant('HELP.EXIT'),
                exitOnEsc: true,
                exitOnOverlayClick: false
            });
        this.introJS.start();
    }
}
