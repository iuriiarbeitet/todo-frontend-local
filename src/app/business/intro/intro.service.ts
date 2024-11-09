import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as introJs from 'intro.js';


@Injectable({
    providedIn: 'root'
})

// класс для работы с intro (выделение областей страницы и их описание)
export class IntroService {

    introJS = introJs(); // объект по работе с intro

    constructor(
        private translate: TranslateService // локализация
    ) {

    }

    // показать интро (справку) с подсветкой элементов
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
