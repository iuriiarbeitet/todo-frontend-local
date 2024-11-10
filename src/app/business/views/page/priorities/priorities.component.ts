import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';
import {EditPriorityDialogComponent} from '../../dialog/edit-priority-dialog/edit-priority-dialog.component';
import {DialogAction} from '../../../object/DialogResult';
import {MatDialog} from '@angular/material/dialog';
import {User} from '../../../../auth/service/auth.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {TranslateService} from '@ngx-translate/core';
import {Priority} from '../../../model/Priority';

@Component({
    selector: 'app-priorities',
    templateUrl: './priorities.component.html',
    styleUrls: ['./priorities.component.css']
})
export class PrioritiesComponent implements OnInit {
    static defaultColor = '#fcfcfc';

    // ----------------------- eingehende Parameter ----------------------------

    @Input()
    priorities: [Priority];

    @Input()
    user: User;


    // ----------------------- ausgehende Aktionen ----------------------------

    // gelöscht
    @Output()
    deletePriorityEvent = new EventEmitter<Priority>();

    // geändert
    @Output()
    updatePriorityEvent = new EventEmitter<Priority>();

    // hinzugefügt
    @Output()
    addPriorityEvent = new EventEmitter<Priority>();

    isMobile: boolean; // Haben Sie über ein mobiles Gerät auf die Website zugegriffen oder nicht?

    constructor(private dialog: MatDialog, // um ein neues Dialogfeld zu öffnen (aus dem aktuellen)
                private translate: TranslateService, // Lokalisierung
                private deviceService: DeviceDetectorService, // um den Gerätetyp zu bestimmen

    ) {
        this.isMobile = this.deviceService.isMobile();
    }

    ngOnInit(): void {
    }

    // Dialogfeld zum Hinzufügen
    openAddDialog(): void {

        const dialogRef = this.dialog.open(EditPriorityDialogComponent,
            {
                data:
                // Übergeben eines neuen leeren Objekts zum Füllen
                    [new Priority(null, '', PrioritiesComponent.defaultColor, this.user),
                        this.translate.instant('PRIORITY.ADDING')], width: '400px'
            });

        dialogRef.afterClosed().subscribe(result => {

            if (!(result)) { // wenn Sie gerade das Fenster geschlossen haben, ohne auf etwas zu klicken
                return;
            }
            if (result.action === DialogAction.SAVE) {
                const newPriority = result.obj as Priority;
                this.addPriorityEvent.emit(newPriority);
            }
        });
    }

    // Bearbeitung
    openEditDialog(priority: Priority): void {

        const dialogRef = this.dialog.open(EditPriorityDialogComponent, {
          // Wir übergeben eine Kopie des Objekts, damit sich alle Änderungen nicht auf das Original auswirken
          // (sodass sie rückgängig gemacht werden können)
            data: [new Priority(priority.id, priority.title, priority.color, this.user), this.translate.instant('PRIORITY.EDITING')]
        });
        dialogRef.afterClosed().subscribe(result => {
            if (!(result)) { // wenn Sie gerade das Fenster geschlossen haben, ohne auf etwas zu klicken
                return;
            }

            if (result.action === DialogAction.DELETE) {
                this.deletePriorityEvent.emit(priority);
                return;
            }

            if (result.action === DialogAction.SAVE) {
                priority = result.obj as Priority; // Bearbeitetes Objekt erhalten
                this.updatePriorityEvent.emit(priority);
                return;
            }
        });
    }

    // Symbol „Löschen“ in der allgemeinen Liste
    openDeleteDialog(priority: Priority): void {

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            maxWidth: '500px',
            data: {
                dialogTitle: this.translate.instant('COMMON.CONFIRM'),
                message: this.translate.instant('PRIORITY.CONFIRM-DELETE', {name: priority.title})
            },
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {

            if (!(result)) { // wenn Sie gerade das Fenster geschlossen haben, ohne auf etwas zu klicken
                return;
            }

            if (result.action === DialogAction.OK) {
                this.deletePriorityEvent.emit(priority);
            }
        });
    }
}
