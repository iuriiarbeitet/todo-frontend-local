import {Component, Inject, OnInit} from '@angular/core';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {DialogAction, DialogResult} from '../../../object/DialogResult';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {Priority} from '../../../model/Priority';


@Component({
  selector: 'app-edit-priority-dialog',
  templateUrl: './edit-priority-dialog.component.html',
  styleUrls: ['./edit-priority-dialog.component.css']
})

// Erstellen/Bearbeiten einer Kategorie
export class EditPriorityDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<EditPriorityDialogComponent>, // um mit dem aktuellen Dialogfenster arbeiten zu können
    @Inject(MAT_DIALOG_DATA) private data: [Priority, string], // Daten, die an das Dialogfeld übergeben wurden
    private dialog: MatDialog, // um ein neues Dialogfeld (aus dem aktuellen) zu öffnen – beispielsweise um den Löschvorgang zu bestätigen
    private translate: TranslateService // Lokalisierung
  ) {
  }

  dialogTitle: string;
  priority: Priority; // Text für den Prioritätsnamen (beim Bearbeiten oder Hinzufügen)
  canDelete = false; // Ist es möglich, ein Objekt zu löschen (ist die Schaltfläche „Löschen“ aktiv)?

  ngOnInit(): void {
    this.priority = this.data[0];
    this.dialogTitle = this.data[1];

    // Wenn eine ID vorhanden ist, handelt es sich um eine Bearbeitung, daher ermöglichen wir das Löschen.
    if (this.priority && this.priority.id > 0) {
      this.canDelete = true;
    }
  }

  // klickte auf OK
  confirm(): void {

    // Wenn Sie keinen Namen eingegeben haben, beenden wir die Methode und lassen Sie sie nicht speichern
    // (Der Benutzer muss einen Wert eingeben oder einfach das Fenster schließen)
    if (!this.priority.title || this.priority.title.trim().length === 0) {
      return;
    }
    this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.priority)); // Zurückgeben des geänderten Objekts
  }

  // Abbrechen gedrückt
  cancel(): void {
    this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
  }

  // klickte auf Löschen
  delete(): void {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('PRIORITY.CONFIRM-DELETE', {name: this.priority.title})
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // wenn Sie gerade das Fenster geschlossen haben, ohne auf etwas zu klicken
        return;
      }
      if (result.action === DialogAction.OK) {
        this.dialogRef.close(new DialogResult(DialogAction.DELETE)); // auf Löschen geklickt
      }
    });

  }
}
