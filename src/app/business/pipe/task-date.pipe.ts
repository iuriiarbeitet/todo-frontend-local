import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

// Konvertiert das Datum in das gewünschte Textformat

// Dokumentation https://angular.io/guide/pipes

@Pipe({
    name: 'taskDate'
})
export class TaskDatePipe implements PipeTransform {

    constructor(private translate: TranslateService) {

    }

    transform(date: Date | string, format: string = 'mediumDate'): string { // mediumDate - Standardformatierung

        if (!date) {
            return this.translate.instant('TASKS.WITHOUT-DATE');
        }

        date = new Date(date); // Aus dem String erstellen wir Date, um weiter mit dem Date-Objekt arbeiten zu können

        const currentDate = new Date().getDate();

        if (date.getDate() === currentDate) {
            return this.translate.instant('TASKS.TODAY');
        }

        if (date.getDate() === currentDate - 1) {
            return this.translate.instant('TASKS.YESTERDAY');
        }

        if (date.getDate() === currentDate + 1) {
            return this.translate.instant('TASKS.TOMORROW');

        }

        return new DatePipe(this.translate.currentLang).transform(date, format); // Zeigt das Datum im gewünschten Gebietsschema an
    }

}
