import {Component, Inject, Input, OnInit, Output} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {User} from '../../../../auth/service/auth.service';
import {EditCategoryDialogComponent} from '../../dialog/edit-category-dialog/edit-category-dialog.component';
import {TranslateService} from '@ngx-translate/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {DialogAction} from '../../../object/DialogResult';
import {EventEmitter} from '@angular/core';
import {CategorySearchValues} from '../../../data/dao/search/SearchObjects';
import {Category} from '../../../model/Category';
import {Stat} from '../../../model/Stat';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})

// "Component": zeigt die empfangenen Daten an und sendet alle Aktionen an den Handler
export class CategoriesComponent implements OnInit {

  // Die Komponente interagiert mit der „Außenwelt“ nur durch @Input() und @Output !!!

  /*
  Prinzip der Kapselung und „losen Kopplung“
  (Low Coupling) aus GRASP — General Responsibility Assignment Software Patterns
  (Grundmuster der Verantwortungsverteilung in Software)
  с помощью @Output() сигнализируем о том, что произошло событие выбора категории (кто будет это обрабатывать - компонент не знает)
  */
  // Setter werden für zusätzliche Zwecke verwendet Funktionalität - um die erforderlichen Methoden aufzurufen, wenn sich der Wert ändert.
  // Sie können auch reguläre Variablen verwenden
  @Input('user')
  set setUser(user: User) {
    this.user = user;
  }

  @Input('categories')
  set setCategories(categories: Category[]) {
    this.categories = categories; // Kategorien, die angezeigt werden sollen
  }

  @Input('categorySearchValues')
  set setCategorySearchValues(categorySearchValues: CategorySearchValues) {
    this.categorySearchValues = categorySearchValues;
  }

  @Input('selectedCategory')
  set setCategory(selectedCategory: Category) {
    this.selectedCategory = selectedCategory;
  }

  // allgemeine Statistiken
  @Input('stat')
  set statVar(stat: Stat) {
    this.stat = stat;
  }

  // Hinzufügen einer Kategorie
  @Output()
  addCategoryEvent = new EventEmitter<Category>(); // Wir übermitteln nur den Namen der neuen Kategorie

  // Kategorie ändern
  @Output()
  updateCategoryEvent = new EventEmitter<Category>();

  // Löschen einer Kategorie
  @Output()
  deleteCategoryEvent = new EventEmitter<Category>();

  // Kategorie Suche
  @Output()
  searchCategoryEvent = new EventEmitter<CategorySearchValues>(); // Измените строку стихотворения

  // закрыть меню
  @Output()
  toggleMenuEvent = new EventEmitter(); // Übergeben Sie die Suchzeichenfolge

  // eine Kategorie aus der Liste ausgewählt
  @Output()
  selectCategoryEvent = new EventEmitter<Category>();


  // -------------------------------------------------------------------------
  // Es empfiehlt sich, gewöhnliche Variablen von @Input und @Output zu trennen

  isMobile: boolean; // Haben Sie über ein mobiles Gerät auf die Website zugegriffen oder nicht?

  categories: Category[]; // Kategorien, die angezeigt werden sollen

  // um das Bearbeitungssymbol anzuzeigen, wenn Sie mit der Maus über eine Kategorie fahren (Desktop-Version)
  indexCategoryMouseOver: number;
  showEditIconCategoryIcon: boolean; // ob das Kategorie bearbeitungssymbol angezeigt werden soll (in Haupt-Smart-Komponente initialisiert)

  // um Kategorien zu durchsuchen
  searchTitle: string; // Text für die Suche nach Kategorien
  filterChanged: boolean; // Gab es Änderungen an den Suchparametern?
  categorySearchValues: CategorySearchValues; // Kategorien suchoptionen

  selectedCategory: Category; // Ausgewählte Kategorie – wenn null – wird die Kategorie ausgewählt

  user: User; // aktueller Benutzer

  // allgemeine Statistiken
  stat: Stat;

  constructor(
    private dialogRef: MatDialogRef<EditCategoryDialogComponent>, // um mit dem aktuellen Dialog zu arbeiten. Fenster
    @Inject(MAT_DIALOG_DATA) private data: [Category, string], // Daten, die wir in das Dialogfenster übertragen können
    private dialogBuilder: MatDialog, // um ein neues Dialogfeld zu öffnen (aus dem aktuellen)
    private translate: TranslateService, // Lokalisierung
    private deviceService: DeviceDetectorService, // Geräteerkennung
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
  }

  // Dialogfeld zum Hinzufügen einer neuen Kategorie
  openAddDialog(): void {

    this.dialogRef = this.dialogBuilder.open(EditCategoryDialogComponent, {
      // Übergeben eines neuen leeren Objekts zum Füllen
      data: [new Category(null, '', this.user), this.translate.instant('CATEGORY.ADDING')],
      width: '400px'
    });

    // Melden Sie sich an, um den Dialog Fenster zu schließen.
    this.dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // wenn Sie gerade das Fenster geschlossen haben, ohne auf etwas zu klicken
        return;
      }
      if (result.action === DialogAction.SAVE) { // wenn Sie auf Speichern geklickt haben
        this.addCategoryEvent.emit(result.obj as Category); // Rufen Sie den externen Handler auf
      }
    });
  }

  // speichert den Index des Kategorie eintrags, über den sich die Maus gerade bewegt (und das Bearbeitungssymbol wird dort angezeigt)
  updateEditIconVisible(show: boolean, index: number): void {

    this.showEditIconCategoryIcon = show; // Symbol anzeigen oder ausblenden
    this.indexCategoryMouseOver = index; // um zu verstehen, welches Element wir oben sind
  }

  // Dialogfeld zum Bearbeiten der Kategorie
  openEditDialog(category: Category): void {

    this.dialogRef = this.dialogBuilder.open(EditCategoryDialogComponent, {
      // Wir übergeben eine Kopie des Objekts, damit sich alle Änderungen nicht auf das Original auswirken
      // (sodass sie rückgängig gemacht werden können)
      data: [new Category(category.id, category.title, this.user), this.translate.instant('CATEGORY.EDITING')],
      width: '400px'
    });

    // Melden Sie sich an, um das Dialogfeld zu schließen.
    this.dialogRef.afterClosed().subscribe(result => {

      if (!(result)) { // wenn Sie gerade das Fenster geschlossen haben, ohne auf etwas zu klicken
        return;
      }

      if (result.action === DialogAction.DELETE) { // auf Löschen geklickt
        this.deleteCategoryEvent.emit(category); // Rufen Sie den externen Handler auf
        return;
      }

      if (result.action === DialogAction.SAVE) { // auf „Speichern“ geklickt (behandelt sowohl das Hinzufügen als auch das Löschen)
        this.updateCategoryEvent.emit(result.obj as Category); // Rufen Sie den externen Handler auf
        return;
      }
    });
  }

  // Löschen Sie das Suchfeld und aktualisieren Sie die Kategorieliste erneut
  clearAndSearch(): void {
    this.searchTitle = null;
    this.search(); // Bei einer Suche mit leerem searchTitle werden alle Kategorien zurückgegeben
  }

  // prüft, ob Suchparameter geändert wurden (im Vergleich zum alten Wert)
  checkFilterChanged(): void {
    this.filterChanged = this.searchTitle !== this.categorySearchValues.title;
  }

// Kategorie Suche
  search(): void {

    this.filterChanged = false; // zurücksetzen

    if (!this.categorySearchValues) { // wenn das Objekt mit Suchparametern nicht leer ist
      return;
    }
    this.categorySearchValues.title = this.searchTitle; // Speichern Sie den eingegebenen Benutzertext in einer Variablen
    this.searchCategoryEvent.emit(this.categorySearchValues);
  }

  // prüft, ob noch Zeichen im Textfeld vorhanden sind
  checkEmpty(): void {
    if (this.searchTitle.trim().length === 0) {
      this.search(); // automatisch nach Kategorien suchen (alle Werte zurücksetzen)
    }
  }

  toggleMenu(): void {
    this.toggleMenuEvent.emit(); // Menü schließen
  }

  // Wählen Sie eine Kategorie aus, um die entsprechende anzuzeigen, Aufgaben
  showCategory(category: Category): void {

    // Wenn sich der Wert nicht geändert hat, tun Sie nichts (um keine erneuten Datenanforderungen zu stellen).
    if (this.selectedCategory === category) {
      return;
    }
    this.selectedCategory = category; // Speichern Sie die ausgewählte Kategorie
    this.selectCategoryEvent.emit(this.selectedCategory); // Rufen Sie den externen Handler auf und übergeben Sie die ausgewählte Kategorie
  }
}
