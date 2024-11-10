import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {DialogAction, DialogResult} from '../../../object/DialogResult';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {Category} from '../../../model/Category';


@Component({
    selector: 'app-edit-category-dialog',
    templateUrl: './edit-category-dialog.component.html',
    styleUrls: ['./edit-category-dialog.component.css']
})

// Erstellen/Bearbeiten einer Kategorie
export class EditCategoryDialogComponent implements OnInit {

    constructor(
        private dialogRef: MatDialogRef<EditCategoryDialogComponent>, // um mit dem aktuellen Dialogfenster zu arbeiten
        @Inject(MAT_DIALOG_DATA) private data: [Category, string], // Daten, die an das Dialogfeld übergeben wurden
        private dialogBuilder: MatDialog, // um ein neues Dialogfeld zu öffnen – beispielsweise um den Löschvorgang zu bestätigen
        private translate: TranslateService // Lokalisierung
    ) {
    }

    dialogTitle: string; // Text für das Dialogfeld
    category: Category; // übergebenes Objekt zur Bearbeitung
    canDelete = false; // Ist es möglich, ein Objekt zu löschen (ist die Schaltfläche „Löschen“ aktiv)?

    ngOnInit(): void {

        // die übergebenen Daten von der Komponente empfangen
        this.category = this.data[0];
        this.dialogTitle = this.data[1];

        // Wenn ein Wert übergeben wurde, handelt es sich um eine Bearbeitung, daher ermöglichen wir das Löschen.
        if (this.category && this.category.id && this.category.id > 0) {
            this.canDelete = true;
        }
    }

  // klickte auf OK
  confirm(): void {

    // Wenn Sie keinen Namen eingegeben haben, beenden wir die Methode und lassen Sie sie nicht speichern
    // (Der Benutzer muss einen Wert eingeben oder einfach das Fenster schließen)
    if (!this.category.title || this.category.title.trim().length === 0){
      return;
    }

    // Klicken Sie auf OK und übertragen Sie die geänderte Kategorie objekt
    this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.category));
  }

  // Abbrechen gedrückt
  cancel(): void {
    this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
  }

  // klickte auf Löschen
  delete(): void {

    const dialogRef = this.dialogBuilder.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('CATEGORY.CONFIRM-DELETE', {name: this.category.title})
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // wenn Sie gerade das Fenster geschlossen haben, ohne auf etwas zu klicken
        return;
      }
      if (result.action === DialogAction.OK) {
        this.dialogRef.close(new DialogResult(DialogAction.DELETE)); // bestätigte Löschung
      }
    });
  }
}
