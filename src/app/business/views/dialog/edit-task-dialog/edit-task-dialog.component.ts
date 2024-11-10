import {Component, Inject, OnInit} from '@angular/core';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {DeviceDetectorService} from 'ngx-device-detector';
import {DialogAction, DialogResult} from '../../../object/DialogResult';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Category} from '../../../model/Category';
import {Priority} from '../../../model/Priority';
import {Task} from 'src/app/business/model/Task';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.css']
})

// Bearbeiten/Erstellen einer Aufgabe
export class EditTaskDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<EditTaskDialogComponent>, // um mit dem aktuellen Dialogfenster arbeiten zu können
    @Inject(MAT_DIALOG_DATA) private data: [Task, string, Category[], Priority[]], // Daten, in aktuelle Dialogfeld übertragen werden
    private dialog: MatDialog, // um ein neues Dialogfeld (aus aktuellen) zu öffnen – beispielsweise um den Löschvorgang zu bestätigen
    private deviceService: DeviceDetectorService, // Erkennung von Benutzergeräten
    private translate: TranslateService // Lokalisierung
  ) {
  }

  // zur Auswahl aus Ausfallschritt. Liste - wir holen uns die Sammlungen von der Hauptseite
  // (über die Parameter des Dialogfensters), sodass wir hier nicht noch einmal eine Anfrage an die Datenbank stellen müssen
  categories: Category[];
  priorities: Priority[];

  isMobile = this.deviceService.isMobile();

  dialogTitle: string;
  task: Task; // Aufgabe zum Bearbeiten/Erstellen

  // alle Werte in separaten Variablen speichern,
  // damit sich Änderungen nicht auf die Aufgabe selbst auswirken und Änderungen abgebrochen werden können
  newTitle: string;
  newPriorityId: number;
  newCategoryId: number;
  newDate: Date;

  // Wir speichern auch die alte Kategorie-ID, damit wir sie wissen können
  // was war die Kategorie vorher (wird für die korrekte Aktualisierung der Zähler benötigt)
  oldCategoryId: number;

  canDelete = false; // Ist es möglich, ein Objekt zu löschen (ist die Schaltfläche „Löschen“ aktiv)?
  canComplete = false; // ob die Aufgabe erledigt werden kann (abhängig vom aktuellen Status)

  today = new Date(); // speichert das heutige Datum

  ngOnInit(): void {
    this.task = this.data[0]; // Aufgabe zum Bearbeiten/Erstellen
    this.dialogTitle = this.data[1]; // Text für das Dialogfeld
    this.categories = this.data[2]; // Kategorien für Dropdown-Liste
    this.priorities = this.data[3]; // Prioritäten für Dropdown-Liste

    // wenn ein Wert übergeben wurde, dann ist dies eine Bearbeitung (keine Erstellung einer neuen Aufgabe),
    // deshalb machen wir das Löschen möglich (ansonsten verstecken wir das Icon)
    if (this.task && this.task.id > 0) {
      this.canDelete = true;
      this.canComplete = true;
    }

    // Initialisierung von Anfangswerten (Schreiben in separate Variablen
    // damit Sie die Änderungen rückgängig machen können, sonst werden sie sofort in die Aufgabe geschrieben)

    this.newTitle = this.task.title;

    // Damit Dropdown-Listen auf einer HTML-Seite ordnungsgemäß funktionieren, nicht mit Objekten, sondern mit deren ID zu arbeiten
    if (this.task.priority) {
      this.newPriorityId = this.task.priority.id;
    }

    if (this.task.category) {
      this.newCategoryId = this.task.category.id;
      this.oldCategoryId = this.task.category.id; // Hier wird immer der alte Kategorie-Wert gespeichert
    }

    if (this.task.taskDate) {

      // Erstellen Sie ein neues Datum, damit das übertragene Datum aus der Aufgabe automatisch in die aktuelle Zeitzone konvertiert wird
      // (sonst wird die UTC-Zeit angezeigt)
      this.newDate = new Date(this.task.taskDate);
    }
  }

  // klickte auf OK
  confirm(): void {

    // Wenn Sie keinen Namen eingegeben haben, beenden wir die Methode und lassen Sie sie nicht speichern
    // (Der Benutzer muss einen Wert eingeben oder einfach das Fenster schließen)
    if (!this.newTitle || this.newTitle.trim().length === 0) {
      return;
    }
    // Wir lesen alle zu speichernden Werte in die Aufgabenfelder ein
    this.task.title = this.newTitle;
    this.task.priority = this.findPriorityById(this.newPriorityId);
    this.task.category = this.findCategoryById(this.newCategoryId);
    this.task.oldCategory = this.findCategoryById(this.oldCategoryId);

    if (!this.newDate) {
      this.task.taskDate = null;
    } else {
      // Im Feld wird das Datum in der aktuellen Zeitzone gespeichert, in der Datenbank wird das Datum automatisch im UTC-Format gespeichert
      this.task.taskDate = this.newDate;
    }
    // Übertragen Sie die hinzugefügte/geänderte Aufgabe an den Handler was sie damit machen, ist die Aufgabe dieser Komponente
    this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.task));
  }

  // auf „Abbrechen“ geklickt (nichts speichern und das Fenster schließen)
  cancel(): void {
    this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
  }

  // klickte auf Löschen
  delete(): void {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('TASKS.CONFIRM-DELETE', {name: this.task.title})
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
  // klickte auf „Aufgabe ausführen (abschließen)“.
  complete(): void {
    this.dialogRef.close(new DialogResult(DialogAction.COMPLETE));
  }
  // Den Aufgabenstatus auf „unvollständig“ setzen (aktivieren)
  activate(): void {
    this.dialogRef.close(new DialogResult(DialogAction.ACTIVATE));
  }

  private findPriorityById(tmpPriorityId: number): Priority {
    return this.priorities.find(t => t.id === tmpPriorityId);
  }

  private findCategoryById(tmpCategoryId: number): Category {
    return this.categories.find(t => t.id === tmpCategoryId);
  }

  // Datum + Anzahl der Tage einstellen
  addDays(days: number): void {
    this.newDate = new Date();
    this.newDate.setDate(this.today.getDate() + days); // Fügen Sie die erforderliche Anzahl an Tagen hinzu
  }

  // Datum auf „heute“ setzen
  setToday(): void {
    this.newDate = this.today;
  }
}
