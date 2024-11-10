import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DialogAction, DialogResult} from '../../../object/DialogResult';
import {User} from '../../../../auth/service/auth.service';
import {LANG_EN, LANG_DE} from '../../page/main/main.component';
import {PriorityService} from '../../../data/dao/impl/PriorityService';
import {TranslateService} from '@ngx-translate/core';
import {Priority} from '../../../model/Priority';


@Component({
    selector: 'app-settings-dialog',
    templateUrl: './settings-dialog.component.html',
    styleUrls: ['./settings-dialog.component.css']
})

/*
Dialogfeld „Anwendungseinstellungen“.
Weil Einstellungen sind nicht an andere Komponenten (Fenster) gebunden,
dann kann er die benötigten Daten selbstständig per dataHandler laden (und nicht per @Input empfangen)
 */

export class SettingsDialogComponent implements OnInit {

    priorities: Priority[]; // Prioritätenliste zum Bearbeiten/Löschen
    settingsChanged = false; // wurden die Einstellungen geändert?
    lang: string; // speichert die ausgewählte Sprache in den Einstellungen
    user: User;
    isLoading: boolean;

    en = LANG_EN;
    de = LANG_DE;

    constructor(
        private dialogRef: MatDialogRef<SettingsDialogComponent>, // um mit dem aktuellen Dialogfenster arbeiten zu können
        @Inject(MAT_DIALOG_DATA) private data: [User], // Daten, die in das aktuelle Dialogfeld übertragen werden
        private priorityService: PriorityService, // Link zum Dienst zum Arbeiten mit Daten
        private translate: TranslateService, // zur Lokalisierung
    ) {
        this.lang = translate.currentLang;
    }

    ngOnInit(): void {
        this.user = this.data[0]; // Aktuellen Benutzer abrufen

        // Holen Sie sich alle Prioritäten, um die Farbeinstellung anzuzeigen
        this.loadPriorities();
    }

    private loadPriorities(): void {
        this.isLoading = true;
        this.priorityService.findAll(this.user.email).subscribe(priorities => {
            this.priorities = priorities;
            this.isLoading = false;
        });
    }

    close(): void {

        if (this.settingsChanged) { // wenn es Änderungen in den Einstellungen gibt
            this.dialogRef.close(new DialogResult(DialogAction.SETTINGS_CHANGE, this.priorities));
        } else {
            this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
        }
    }


    // zusätzliche Priorität
    addPriority(priority: Priority): void {

        priority.user = this.user;

        this.settingsChanged = true; // Es gab Änderungen in den Einstellungen

        // erstes Update in der Datenbank
        this.priorityService.add(priority).subscribe(result => {
            this.priorities.push(result);
        });
    }

    // Priorität entfernt
    deletePriority(priority: Priority): void {

        this.settingsChanged = true; // Es gab Änderungen in den Einstellungen

        this.priorityService.delete(priority.id).subscribe(() => {
                this.priorities.splice(this.getPriorityIndex(priority), 1);
            }
        );
    }

    // aktualisierte Priorität
    updatePriority(priority: Priority): void { // priority - geändertes Objekt, das an das Backend gesendet werden soll

        this.settingsChanged = true;

        this.priorityService.update(priority).subscribe(() => {
                this.priorities[this.getPriorityIndex(priority)] = priority;
            }
        );
    }

    // findet den Index eines Elements (nach ID) in einem lokalen Array
    getPriorityIndex(priority: Priority): number {
        const tmpPriority = this.priorities.find(t => t.id === priority.id);
        return this.priorities.indexOf(tmpPriority);
    }

    // Sprache wechseln
    langChanged(): void {
        this.translate.use(this.lang); // Stellen Sie sofort die Sprache für die Anwendung ein
        this.settingsChanged = true; // zeigen an, dass die Einstellungen geändert wurden
    }
}
