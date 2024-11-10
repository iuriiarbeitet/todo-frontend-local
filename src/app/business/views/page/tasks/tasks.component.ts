import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {MatDialog} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {User} from '../../../../auth/service/auth.service';
import {TaskSearchValues} from '../../../data/dao/search/SearchObjects';
import {TranslateService, TranslationChangeEvent} from '@ngx-translate/core';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';
import {DialogAction} from '../../../object/DialogResult';
import {EditTaskDialogComponent} from '../../dialog/edit-task-dialog/edit-task-dialog.component';
import {PageEvent} from '@angular/material/paginator';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Category} from '../../../model/Category';
import {Task} from 'src/app/business/model/Task';
import {Priority} from '../../../model/Priority';


@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],

  animations: [

    trigger('searchRegion', [
      state('show', style({
        overflow: 'hidden',
        height: '*',
        opacity: '10',
      })),
      state('hide', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
      })),

      transition('* => *', animate('300ms ease-in-out'))
    ])
  ]
})

// "presentational component": zeigt die empfangenen Daten an und sendet alle Aktionen an den Handler
// Zweck - Arbeiten mit einer Liste von Aufgaben
export class TaskListComponent implements OnInit {

  // ------------- Eingehende Parameter -----------------------
  // Variablen zum Einrichten der Paginierung müssen zuerst initialisiert werden (vor der Aktualisierung von Aufgaben)
  // damit die Paginierungskomponente korrekt funktioniert

  @Input()
  totalTasksFounded: number; // Wie viele Probleme wurden gefunden?

  @Input()
  user: User; // aktueller Benutzer

  @Input()
  selectedCategory: Category; // ausgewählte Kategorie

  // Aufgaben, die auf der Seite angezeigt werden sollen
  @Input('tasks')
  set setTasks(tasks: Task[]) {
    this.tasks = tasks;
    this.assignTableSource();   // Übergeben Sie Daten an die Tabelle, um Aufgaben anzuzeigen
  }

  // alle möglichen Parameter für Suchaufgaben
  @Input('taskSearchValues')
  set setTaskSearchValues(taskSearchValues: TaskSearchValues) {
    this.taskSearchValues = taskSearchValues;
    this.initSearchValues(); // in lokale Variablen schreiben
    this.initSortDirectionIcon(); // das richtige Icon in der Aufgabensuche anzeigen (absteigend, aufsteigend)
  }

  // Prioritäten zum Filtern und Auswählen beim Bearbeiten/Erstellen einer Aufgabe (Dropdown-Liste)
  @Input('priorities')
  set setPriorities(priorities: Priority[]) {
    this.priorities = priorities;
  }

  // Kategorien beim Bearbeiten/Erstellen einer Aufgabe (Dropdown-Liste)
  @Input('categories')
  set setCategories(categories: Category[]) {
    this.categories = categories;
  }

  @Input('showSearch')
  set setShowSearch(show: boolean) { // Suchwerkzeuge ein-/ausblenden
    this.showSearch = show;
    this.initAnimation();  // Jedes Mal, wenn sich der Wert ändert, wird die Animation ein-/ausgeblendet
  }

  // ----------------------- ausgehende Aktionen ----------------------------

  @Output()
  addTaskEvent = new EventEmitter<Task>();

  @Output()
  deleteTaskEvent = new EventEmitter<Task>();

  @Output()
  updateTaskEvent = new EventEmitter<Task>();

  @Output()
  pagingEvent = new EventEmitter<PageEvent>(); // Navigation durch Datenseiten

  @Output()
  toggleSearchEvent = new EventEmitter<boolean>(); // Suche ein-/ausblenden

  @Output()
  searchActionEvent = new EventEmitter<TaskSearchValues>(); // Navigation durch Datenseiten


  priorities: Priority[]; // Prioritätenliste (zum Filtern von Aufgaben, für Dropdown-Listen)
  categories: Category[]; // Liste der Kategorien
  tasks: Task[]; // aktuelle Liste der anzuzeigenden Aufgaben

  // Felder für die Tabelle (diejenigen, die Daten aus der Aufgabe anzeigen, müssen mit den Namen der Klassen variablen übereinstimmen)
  displayedColumns: string[] = ['color', 'id', 'title', 'date', 'priority', 'category', 'operations'];
  dataSource: MatTableDataSource<Task> = new MatTableDataSource<Task>(); // Datenquelle für die Tabelle

  // Zu suchende Werte (lokale Variablen – der Einfachheit halber)
  filterTitle: string;
  filterCompleted: number;
  filterPriorityId: number;
  filterSortColumn: string;
  filterSortDirection: string;
  dateRangeForm: FormGroup; // enthält Daten für Filter-/Suchaufgaben


  isMobile: boolean; // Haben Sie über ein mobiles Gerät auf die Website zugegriffen oder nicht?

  // Aufgabensuchparameter – Daten werden zunächst aus Cookies geladen (in app.component)
  taskSearchValues: TaskSearchValues;

  // lokalisierter Text (wenn keine Werte vorhanden sind)
  translateWithoutCategory: string;
  translateWithoutPriority: string;

  animationState: string; // zum Ein-/Ausblenden der Animation eines beliebigen Bereichs
  showSearch = false; // Suchbereich ein-/ausblenden


  // цвета
  readonly colorCompletedTask = '#F8F9FA';
  readonly colorWhite = '#fff';

  // Gab es Änderungen an den Suchfiltern?
  filterChanged = false;

  // Sortiersymbol (absteigend, aufsteigend)
  sortIconName: string;
  // Namen von Ikonen aus der Sammlung
  readonly iconNameDown = 'arrow_downward';
  readonly iconNameUp = 'arrow_upward';

  readonly defaultSortColumn = 'title';
  readonly defaultSortDirection = 'asc';

  constructor(
    private dialog: MatDialog, // Arbeiten mit einem Dialogfeld
    private deviceService: DeviceDetectorService, // um den Gerätetyp zu bestimmen
    private translate: TranslateService, // Lokalisierung
  ) {
    this.isMobile = this.deviceService.isMobile();
  }

  ngOnInit(): void {
    // Wenn sich die Sprache ändert, aktualisieren Sie die in Variablen gespeicherten Übersetzungen
    this.translate.onLangChange.subscribe((event: TranslationChangeEvent) => {
      this.initTranslations();
    });
    this.initDateRangeForm();
  }

  // Link zu Formularkomponenten (um den Code zu kürzen, damit er nicht geschrieben wird this.datePickerRange.get('') )
  get dateFrom(): AbstractControl {
    return this.dateRangeForm.get('dateFrom');
  }

  // Link zu Formularkomponenten (um den Code zu kürzen, damit er nicht geschrieben wird this.datePickerRange.get('') )
  get dateTo(): AbstractControl {
    return this.dateRangeForm.get('dateTo');
  }

  // Aktualisieren Sie Übersetzungen, die in Variablen gespeichert sind
  initTranslations(): void {
    this.translate.get(['TASKS.WITHOUT-CATEGORY', 'TASKS.WITHOUT-PRIORITY']).subscribe((res: string) => {
      this.translateWithoutCategory = res['TASKS.WITHOUT-CATEGORY']; // в нужном переводе
      this.translateWithoutPriority = res['TASKS.WITHOUT-PRIORITY'];
    });
  }

  // Übergeben Sie Daten an die Tabelle, um Aufgaben anzuzeigen
  assignTableSource(): void {

    // Für die Tabelle muss eine Datenquelle erstellt werden; ihr wird eine beliebige Quelle (DB, Arrays, JSON usw.) zugewiesen.
    if (!this.dataSource) {
      return;
    }
    this.dataSource.data = this.tasks; // Aktualisieren Sie die Datenquelle (da die Daten des Aufgabenarrays aktualisiert wurden).
  }

  // Abhängig vom Status der Aufgabe - geben Sie die Farbe zurück
  getPriorityColor(task: Task): string {

    // Wenn die Aufgabe abgeschlossen ist, geben Sie die Farbe zurück
    if (task.completed) {
      return this.colorCompletedTask;
    }
    // Gibt die Priorität farbe zurück, falls angegeben
    if (task.priority && task.priority.color) {
      return task.priority.color;
    }
    return this.colorWhite; // Standardfarbe, wenn keine gefunden wurde
  }

  // gedrückt/losgelassen, um eine Aufgabe abzuschließen
  onToggleCompleted(task: Task): void {

    // Ändern Sie den Wert in das Gegenteil
    if (task.completed === 0) {
      task.completed = 1;
    } else {
      task.completed = 0;
    }
    this.updateTaskEvent.emit(task); // Sie müssen das Objekt in der Datenbank aktualisieren
  }

  // Bestätigungsdialog zum Löschen
  openDeleteDialog(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('TASKS.CONFIRM-DELETE', {name: task.title})
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) { // wenn Sie gerade das Fenster geschlossen haben, ohne auf etwas zu klicken
        return;
      }
      if (result.action === DialogAction.OK) { // wenn Sie auf OK geklickt haben
        this.deleteTaskEvent.emit(task);
      }
    });
  }

  // Dialogbearbeitungsaufgabe
  openEditDialog(task: Task): void {

    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      // Die Aufgabe enthält bereits einige Daten, weil bearbeiten
      data: [task, this.translate.instant('TASKS.EDITING'), this.categories, this.priorities],
      // This.categories, this.priorities - aus der Dropdown-Liste auszuwählen
      autoFocus: false,
      maxHeight: '90vh' // wird 90 % der Bildschirmhöhe einnehmen
    });

    // Abonnieren Sie das Ergebnis des Dialogfelds
    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) { // wenn Sie gerade das Fenster geschlossen haben, ohne auf etwas zu klicken
        return;
      }
      if (result.action === DialogAction.DELETE) {
        this.deleteTaskEvent.emit(task);
        return;
      }
      if (result.action === DialogAction.COMPLETE) {
        task.completed = 1; // Setzen Sie den Aufgabenstatus auf „erledigt“.
        this.updateTaskEvent.emit(task);
      }
      if (result.action === DialogAction.ACTIVATE) {
        task.completed = 0; // Gibt den Aufgabenstatus als „unvollendet“ zurück
        this.updateTaskEvent.emit(task);
        return;
      }
      if (result.action === DialogAction.SAVE) { // wenn Sie auf OK geklickt haben und es ein Ergebnis gibt
        this.updateTaskEvent.emit(task);
        return;
      }
    });
  }

  // Dialogfeld „Aufgabe hinzufügen“.
  openAddDialog(): void {

    // Wir erstellen eine leere Aufgabe, um sie an den Dialog zu senden. Fenster
    const task = new Task(null, '', 0, null, this.selectedCategory, this.user);

    const dialogRef = this.dialog.open(EditTaskDialogComponent, {

      // Übergeben eines neuen leeren Objekts zum Füllen
      // auch Referenzdaten (Kategorien, Prioritäten) übermitteln
      data: [task, this.translate.instant('TASKS.ADDING'), this.categories, this.priorities],
      maxHeight: '95vh' // будет занимать 95% экрана по высоте

    });

    // Abonnieren Sie das Ergebnis des Dialogfelds
    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) { // wenn Sie gerade das Fenster geschlossen haben, ohne auf etwas zu klicken
        return;
      }
      if (result.action === DialogAction.SAVE) { // wenn Sie auf OK geklickt haben
        this.addTaskEvent.emit(task);
      }
    });
  }

  // Dieses Ereignis umfasst sowohl einen Übergang zu einer anderen Seite als auch eine Änderung der Anzahl der Daten auf Seiten (pageSize).
  pageChanged(pageEvent: PageEvent): void {
    this.pagingEvent.emit(pageEvent);
  }

  // Animation der versteckten/anzeigenden Suche
  initAnimation(): void {
    if (this.showSearch) {
      this.animationState = 'show';
    } else {
      this.animationState = 'hide';
    }
  }

  // Ausgangsformulare zum Speichern von Datumsperioden (zur Filterung)
  initDateRangeForm(): void {
    this.dateRangeForm = new FormGroup({
      dateFrom: new FormControl(),
      dateTo: new FormControl()
    });

    // Abonnieren Sie Terminänderungsveranstaltungen
    // (da die aktuelle Version der mat-date-range-input-Komponente kein entsprechendes Ereignis hat, das verarbeitet werden kann
    this.dateFrom.valueChanges.subscribe(() => this.checkFilterChanged());
    this.dateTo.valueChanges.subscribe(() => this.checkFilterChanged());
  }

  // prüft, ob Suchparameter geändert wurden (im Vergleich zum alten Wert)
  checkFilterChanged(): boolean {

    if (!this.taskSearchValues) {
      return;
    }
    this.filterChanged = false;

    // Wir überprüfen alle Filter einzeln (der aktuell eingegebene Wert mit dem zuletzt gespeicherten).
    if (this.taskSearchValues.title !== this.filterTitle) {
      this.filterChanged = true;
    }
    if (this.taskSearchValues.completed !== this.filterCompleted) {
      this.filterChanged = true;
    }
    if (this.taskSearchValues.priorityId !== this.filterPriorityId) {
      this.filterChanged = true;
    }
    if (this.taskSearchValues.sortColumn !== this.filterSortColumn) {
      this.filterChanged = true;
    }
    if (this.taskSearchValues.sortDirection !== this.filterSortDirection) {
      this.filterChanged = true;
    }
    if (this.taskSearchValues.dateFrom !== this.dateFrom.value) {
      this.filterChanged = true;
    }
    if (this.taskSearchValues.dateTo !== this.dateTo.value) {
      this.filterChanged = true;
    }
    return this.filterChanged;
  }

  // Wählen Sie das richtige Symbol (absteigend, aufsteigend) aus, das auf der Seite angezeigt werden soll
  initSortDirectionIcon(): void {
    if (this.filterSortDirection === 'desc') {
      this.sortIconName = this.iconNameDown;
    } else {
      this.sortIconName = this.iconNameUp;
    }
  }

  // Sortierrichtung geändert
  changedSortDirection(): void {

    // filterSortDirection wird dann in taskSearchValues geschrieben
    if (this.filterSortDirection === 'asc') {
      this.filterSortDirection = 'desc';
    } else {
      this.filterSortDirection = 'asc';
    }
    this.initSortDirectionIcon(); // Wenden Sie das richtige Symbol an
  }

  // Lokale Such variablen initialisieren
  initSearchValues(): void {

    if (!this.taskSearchValues) {
      return;
    }

    // Diese lokalen Variablen werden auf der HTML-Seite angezeigt
    this.filterTitle = this.taskSearchValues.title;
    this.filterCompleted = this.taskSearchValues.completed;
    this.filterPriorityId = this.taskSearchValues.priorityId;
    this.filterSortColumn = this.taskSearchValues.sortColumn;
    this.filterSortDirection = this.taskSearchValues.sortDirection;

    // Formular zum Speichern von Kalenderdaten (Aufgaben nach Zeitraum filtern)
    if (this.taskSearchValues.dateFrom) {
      this.dateFrom.setValue(this.taskSearchValues.dateFrom);
    }
    if (this.taskSearchValues.dateTo) {
      this.dateTo.setValue(this.taskSearchValues.dateTo);
    }
  }

  // Lokale Such variablen zurücksetzen
  clearSearchValues(): void {
    this.filterTitle = '';
    this.filterCompleted = null;
    this.filterPriorityId = null;
    this.filterSortColumn = this.defaultSortColumn;
    this.filterSortDirection = this.defaultSortDirection;
    this.clearDateRange(); // klarer Datumszeitraum
  }

  // Löschtermine im Suchfilter
  clearDateRange(): void {
    this.dateFrom.setValue(null);
    this.dateTo.setValue(null);
  }

  // Suchwerkzeuge ein-/ausblenden
  onToggleSearch(): void {
    this.toggleSearchEvent.emit(!this.showSearch);
  }

  // Suchparameter
  initSearch(): void {

    // Werte vor der Suche speichern – alle ausgewählten Benutzerwerte aufzeichnen
    this.taskSearchValues.title = this.filterTitle;
    this.taskSearchValues.completed = this.filterCompleted;
    this.taskSearchValues.priorityId = this.filterPriorityId;
    this.taskSearchValues.sortColumn = this.filterSortColumn;
    this.taskSearchValues.sortDirection = this.filterSortDirection;
    this.taskSearchValues.dateTo = this.dateTo.value; // Die Daten entnehmen wir den Formularfeldern
    this.taskSearchValues.dateFrom = this.dateFrom.value;

    this.searchActionEvent.emit(this.taskSearchValues);

    this.filterChanged = false; // Änderungsflag zurücksetzen
  }
}

