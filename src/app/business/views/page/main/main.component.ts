import {AuthService, User} from '../../../../auth/service/auth.service';
import {TaskService} from '../../../data/dao/impl/TaskService';
import {PriorityService} from '../../../data/dao/impl/PriorityService';
import {CategoryService} from '../../../data/dao/impl/CategoryService';
import {StatService} from '../../../data/dao/impl/StatService';
import {DashboardData} from '../../../object/DashboardData';
import {CategorySearchValues, TaskSearchValues} from '../../../data/dao/search/SearchObjects';
import {TranslateService} from '@ngx-translate/core';
import {PageEvent} from '@angular/material/paginator';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Component, OnInit} from '@angular/core';
import {CookieUtils} from '../../../utils/CookieUtils';
import {SpinnerService} from '../../../spinner/spinner.service';
import { Task } from 'src/app/business/model/Task';
import {Priority} from '../../../model/Priority';
import {Category} from '../../../model/Category';
import {Stat} from '../../../model/Stat';



export const LANG_DE = 'de';
export const LANG_EN = 'en';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  // Gerätetyp
  isMobile: boolean;
  isTablet: boolean;

  user: User = null; // aktueller Benutzer (Konto) – wir erhalten nur seine Daten – per E-Mail

  // Seitenmenüoptionen mit Kategorien
  menuOpened = true; // öffnen-schließen
  menuMode: string; // Art der Verlängerung (oben, schieben usw.)
  menuPosition: string; // Menüpunkt
  showBackdrop: boolean; // ob Dimmen angezeigt werden soll


  tasks: Task[]; // Aktuelle Aufgaben, die auf der Seite angezeigt werden sollen
  priorities: Priority[]; // Prioritäten anzuzeigen
  categories: Category[]; // Kategorien zum Anzeigen und Filtern

  isLoading: boolean; // ob es gerade geladen wird oder nicht (um das Ladesymbol anzuzeigen)

  showStat = true;   // Statistiken ein-/ausblenden

  // Container mit Parametern für die Datensuche
  categorySearchValues = new CategorySearchValues(); // um nach Kategorien zu suchen (einschließlich der Anzeige aller Kategorien)
  taskSearchValues: TaskSearchValues; // Wir erstellen später eine Instanz, wenn wir Daten aus Cookies laden

  // wenn gleich null, wird standardmäßig die Kategorie „Alle“ ausgewählt
  selectedCategory: Category = null; // ausgewählte Kategorie (filtert nur Aufgaben der ausgewählten Kategorie)


  dash: DashboardData = new DashboardData(); // Daten zur Anzeige des Statistik-Dashboards
  stat: Stat; // Allgemeine Statistikdaten – Entitätenklasse zum Abrufen eines Objekts vom Backend

  // wie viele Aufgaben nach der Suche gefunden wurden
  // (für die seitenweise Darstellung ist es wichtig zu wissen, wie viele Datensätze gefunden wurden)
  totalTasksFound: number;

  // Standardwerte für die Paginierung
  readonly defaultPageSize = 5; // wie viele Daten auf der Seite angezeigt werden sollen
  readonly defaultPageNumber = 0; // Aktive geöffnete Seite (zuerst, Index von Grund auf)

  showSearch = false; // Suchbereich

  // ein Dienstprogramm zum Arbeiten mit Cookies - wir erstellen sofort ein Objekt, weil es wird benötigt, um Anfangswerte zu laden
  cookiesUtils = new CookieUtils();

  // Cookie-Namen
  readonly cookieTaskSeachValues = 'todo:searchValues'; // um Suchparameter im JSON-Format zu speichern
  readonly cookieShowStat = 'todo:showStat'; // Statistiken anzeigen oder nicht
  readonly cookieShowMenu = 'todo:showMenu'; // Statistiken anzeigen oder nicht
  readonly cookieShowSearch = 'todo:showSearch'; // Suchwerkzeuge anzeigen oder nicht
  readonly cookieLang = 'todo:lang'; // Schnittstellensprache

  spinner: SpinnerService; // Ladeanzeige in der Mitte des Bildschirms (bei jeder HTTP-Anfrage)

  constructor(
    // Dienste für die Arbeit mit Daten (Fassade)
    private taskService: TaskService,
    private categoryService: CategoryService,
    private priorityService: PriorityService,
    private statService: StatService,
    private authService: AuthService,
    private deviceService: DeviceDetectorService, // zur Bestimmung des Gerätetyps (Mobil, Desktop, Tablet)
    private translate: TranslateService, // zur Lokalisierung
    private spinnerService: SpinnerService // Ladeanzeige in der Mitte des Bildschirms (bei jeder HTTP-Anfrage)

  ) {

  }

  ngOnInit(): void {

    // Auf spinnerService kann nicht direkt über HTML zugegriffen werden, weil privat, also erstellen wir unsere eigene Variable
    this.spinner = this.spinnerService;

    // Bestimmen Sie den Gerätetyp
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();

    this.initSidebar(); // Erstmaliges Laden der ng-Sidebar

    this.initLangCookie(); // Stellen Sie die Sprache der Benutzeroberfläche ein

    // um Daten für einen bestimmten Benutzer zu filtern
    this.authService.currentUser.subscribe(user => {

        this.user = user;
        this.categorySearchValues.email = this.user.email; // Geben Sie sofort Ihre E-Mail-Adresse für zukünftige Suchanfragen an

        // Erstmaliges Laden von Statistiken und andere notwendige Aktionen
        this.statService.getOverallStat(this.user.email).subscribe((result => {
          this.stat = result;

          // Füllen Sie die Kategorien aus
          this.categoryService.findAll(this.user.email).subscribe(res => {
            this.categories = res;

            // Tragen Sie Prioritäten ein
            this.priorityService.findAll(this.user.email).subscribe(prior => {
              this.priorities = prior;
            });

            if (!this.initSearchCookie()) { // Laden Sie alle Cookies herunter, um den Anwendungsstatus wiederherzustellen

              /*
              wenn die Cookies nicht geladen wurden oder keine vorhanden sind (false wurde zurückgegeben),
              dann legen wir die Standardwerte für diese 2 erforderlichen fest. Parameter,
              damit die Anfrage an die Datenbank korrekt verarbeitet wird (sonst kommt es zu einem Fehler)
              andere Parameter können null sein
               */
              this.taskSearchValues = new TaskSearchValues();
              this.taskSearchValues.pageSize = this.defaultPageSize; // erforderlicher Parameter, darf nicht leer sein
              this.taskSearchValues.pageNumber = this.defaultPageNumber; // erforderlicher Parameter, darf nicht leer sein
            }

            if (this.isMobile) { // Für die mobile Version zeigen wir keine Statistiken an
              this.showStat = false;
            } else {
              this.initShowStatCookie(); // Cook – allgemeine Statistiken oben anzeigen oder nicht
            }

            this.initShowSearchCookie(); // Cookie – Suchwerkzeuge anzeigen oder nicht

            // erste Anzeige der Aufgaben beim Laden der Anwendung
            // erst ausführen, nachdem die Statistiken abgeschlossen wurden (da ihre Daten benötigt werden) und Kategorien geladen wurden
            this.selectCategory(this.selectedCategory); // selectedCategory может быть загружен из кука (если был сохранен)
          });
        }));
      }
    );
  }

  // Erstanzeige des linken Menüs (Sidebar)
  initSidebar(): void {

    this.menuPosition = 'left'; // Menü auf der linken Seite

    // Seitenmenüeinstellungen für Mobilgeräte. und Desktop-Optionen
    if (this.isMobile) {
      this.menuOpened = false; // zum Handy Standardmäßig wird das Menü geschlossen
      this.menuMode = 'over'; // zusätzlich zu allen Inhalten
      this.showBackdrop = true; // Wenn Sie auf einen Bereich außerhalb des Menüs klicken, schließen Sie es
    } else { // wenn es ein Desktop ist

      this.initShowMenuCookie(); // NICHT im Handy. Versionen laden den Wert aus dem Cookie
      this.menuMode = 'push'; // wird den Hauptinhalt „verdrängen“, anstatt ihn abzudecken
      this.showBackdrop = false;
    }

  }

  // Menü ein-/ausblenden
  toggleMenu(): void {
    this.menuOpened = !this.menuOpened; // Ändern Sie den Wert in das Gegenteil

    // Speichern Sie den aktuellen Wert in Cookies
    this.cookiesUtils.setCookie(this.cookieShowMenu, String(this.menuOpened));
  }

  // Hinzufügen einer Kategorie
  addCategory(category: Category): void {
    this.categoryService.add(category).subscribe(result => {
        this.searchCategory(this.categorySearchValues); // Kategorie liste aktualisieren
      }
    );
  }

  // Kategorie aktualisierung
  updateCategory(category: Category): void {
    this.categoryService.update(category).subscribe(() => {
      this.searchCategory(this.categorySearchValues); // Aktualisierung der Kategorien liste
    });
  }

  // Kategorie suche
  searchCategory(categorySearchValues: CategorySearchValues): void {
    this.categoryService.findCategories(categorySearchValues).subscribe(result => {
      this.categories = result; // Die Liste wird auf der HTML-Seite automatisch aktualisiert
    });
  }

  // Löschen einer Kategorie
  deleteCategory(category: Category): void {

    // wenn Sie eine zuvor ausgewählte Kategorie (derzeit aktiv) löschen
    if (this.selectedCategory && category.id === this.selectedCategory.id) {
      this.selectedCategory = null; // Wählen Sie die Kategorie „Alle“
    }

    this.categoryService.delete(category.id).subscribe(cat => {
      this.searchCategory(this.categorySearchValues); // Aktualisierung der Kategorien liste
      this.selectCategory(this.selectedCategory);
    });
  }

  // eine Kategorie ausgewählt/geändert (Sie müssen die entsprechenden Aufgaben anzeigen und andere notwendige Aktionen ausführen)
  selectCategory(category: Category): void {
    this.selectedCategory = category; // Merken Sie sich die ausgewählte Kategorie, um sie später an die Haupt-Smart-Komponente zu übergeben

    // Geben Sie die Dashboard-Daten ein
    if (category) { // Wenn eine bestimmte Kategorie ausgewählt wird, übernehmen wir Daten daraus
      this.dash.completedTotal = category.completedCount;
      this.dash.uncompletedTotal = category.uncompletedCount;
    } else { // wenn die Kategorie „Alle“ ausgewählt ist (Kategorie == null) – allgemeine Statistiken anzeigen
      this.dash.completedTotal = this.stat.completedTotal;
      this.dash.uncompletedTotal = this.stat.uncompletedTotal;
    }

    // Zurücksetzen, um das Ergebnis der ersten Seite anzuzeigen
    this.taskSearchValues.pageNumber = 0;

    this.selectedCategory = category; // Merken Sie sich die ausgewählte Kategorie

    // um nach Aufgaben in dieser Kategorie zu suchen
    this.taskSearchValues.categoryId = category ? category.id : null; // (Wenn Kategorie == null, dann werden alle Aufgaben angezeigt)

    // Aktualisieren Sie die Liste der Aufgaben entsprechend der ausgewählten Kategorie und anderen Suchparametern von taskSearchValues
    this.searchTasks(this.taskSearchValues);
  }

  // Statistiken ein- und ausblenden
  toggleStat(showStat: boolean): void {
    this.showStat = showStat;

    // Speichern Sie den aktuellen Wert in Cookies
    this.cookiesUtils.setCookie(this.cookieShowStat, String(showStat));
  }

  // nach Aufgaben suchen (wenn die Parameter null sind, werden alle Benutzeraufgaben gefunden)
  searchTasks(searchTaskValues: TaskSearchValues): void {

    // Speichern Sie den aktuellen Wert in Cookies
    this.cookiesUtils.setCookie(this.cookieTaskSeachValues, JSON.stringify(this.taskSearchValues));

    this.taskSearchValues = searchTaskValues;
    this.taskSearchValues.email = this.user.email; // Angemeldeter Benutzer (um nur seine Aufgaben zu erhalten)

    this.taskService.findTasks(this.taskSearchValues).subscribe(result => { // Das Ergebnis enthält das auslagerbare Objekt aus dem Backend

      this.totalTasksFound = result.totalElements; // wie viele Daten auf der Seite angezeigt werden sollen
      this.tasks = result.content; // Reihe von Aufgaben

    });
  }

  // Statistiken für die Kategorie „Alle“ aktualisieren (und diese Daten im Dashboard anzeigen, wenn die Kategorie „Alle“ ausgewählt ist)
  updateOverallStat(): void {

    this.statService.getOverallStat(this.user.email).subscribe((res => { // Holen Sie sich aktuelle Daten aus der Datenbank
      this.stat = res; // Daten aus der Datenbank erhalten

      if (!this.selectedCategory) { // wenn die Kategorie „Alle“ ausgewählt ist (selectedCategory === null)
        this.dash.uncompletedTotal = this.stat.uncompletedTotal;
        this.dash.completedTotal = this.stat.completedTotal;
      }
    }));
  }

  // Statistiken für eine bestimmte Kategorie aktualisieren (und diese Daten im Dashboard anzeigen, wenn diese Kategorie ausgewählt ist)
  updateCategoryStat(category: Category): void {

    // Weil in der Datenbank werden Statistiken durch Trigger aktualisiert.
    // Anschließend müssen Sie aktuelle Daten für die aktualisierte Kategorie aus der Datenbank abrufen
    this.categoryService.findById(category.id).subscribe(cat => {

      // Wir ersetzen die Kategorie im lokalen Array durch dieselbe neue,
      // jedoch mit aktualisierten Statistiken (die wir gerade vom Backend erhalten haben).
      const tmpCategory = this.categories.find(t => t.id === category.id); // Sie müssen den Index des Objekts abrufen, um es zu ersetzen
      this.categories[this.categories.indexOf(tmpCategory)] = cat; // Ersetzen Sie ein Objekt in einem lokalen Array

      // Dashboard mit Kategorie statistiken anzeigen
      if (this.selectedCategory && this.selectedCategory.id === cat.id) {
        this.dash.uncompletedTotal = cat.uncompletedCount;
        this.dash.completedTotal = cat.completedCount;
      }

    });
  }

  // Aktualisierung der Aufgabe
  updateTask(task: Task): void {

    // Es wäre besser, den Code unten mithilfe der rxjs-Kette umzusetzen
    // (damit er sequenziell und mit Bedingungen ausgeführt wird),
    // aber ich habe mich entschieden, es nicht zu sehr zu verkomplizieren.
    this.taskService.update(task).subscribe(result => {
      if (task.oldCategory) { // wenn in der geänderten Aufgabe eine alte Kategorie angegeben war
        this.updateCategoryStat(task.oldCategory); // aktualisieren wir den Zähler für die alte Kategorie
      }
      if (task.category) { // wenn in der geänderten Aufgabe eine neue Kategorie angegeben war
        this.updateCategoryStat(task.category); // aktualisieren wir den Zähler für die neue Kategorie
      }
      this.updateOverallStat(); // aktualisieren wir die gesamte Statistik (einschließlich des Zählers für die Kategorie "Alle")
      this.searchTasks(this.taskSearchValues); // aktualisieren wir die Aufgabenliste
    });
  }


  // Aufgabe löschen
  deleteTask(task: Task): void {

    // Es wäre besser, den folgenden Code mithilfe einer rxjs-Kette zu implementieren
    // (damit er sequenziell und mit Bedingungen ausgeführt wird),
    // aber ich habe beschlossen, es nicht zu verkomplizieren
    this.taskService.delete(task.id).subscribe(result => {
      if (task.category) { // wenn in der gelöschten Aufgabe eine Kategorie angegeben war
        this.updateCategoryStat(task.category); // Zähler für die angegebene Kategorie aktualisieren
      }
      this.updateOverallStat(); // gesamte Statistik aktualisieren (einschließlich des Zählers für die Kategorie "Alle")
      this.searchTasks(this.taskSearchValues); // Aufgabenliste aktualisieren
    });
  }


  // Aufgabe hinzufügen
  addTask(task: Task): void {
    task.user = this.user; // für welchen Benutzer wird die Aufgabe hinzugefügt

    /*
    Es wäre besser, den folgenden Code mithilfe einer rxjs-Kette zu implementieren
    (damit er sequenziell und mit Bedingungen ausgeführt wird),
    aber ich habe beschlossen, es nicht zu verkomplizieren
    */
    this.taskService.add(task).subscribe(result => {
      if (task.category) { // wenn in der neuen Aufgabe eine Kategorie angegeben wurde
        this.updateCategoryStat(task.category); // Zähler für die angegebene Kategorie aktualisieren
      }
      this.updateOverallStat(); // gesamte Statistik aktualisieren (einschließlich des Zählers für die Kategorie "Alle")
      this.searchTasks(this.taskSearchValues); // Aufgabenliste aktualisieren
    });
  }


  // Anzahl der Elemente pro Seite geändert oder zu einer anderen Seite gewechselt mithilfe des Paginators
  paging(pageEvent: PageEvent): void {

    // wenn die Einstellung "Anzahl der Elemente pro Seite" geändert wurde – neue Anfrage senden und ab Seite 1 anzeigen
    if (this.taskSearchValues.pageSize !== pageEvent.pageSize) {
      this.taskSearchValues.pageNumber = 0; // neue Daten ab Seite 1 anzeigen (Index 0)
    } else {
      // wenn einfach zu einer anderen Seite gewechselt wurde
      this.taskSearchValues.pageNumber = pageEvent.pageIndex; // neuen pageNumber-Wert lesen
    }
    this.taskSearchValues.pageSize = pageEvent.pageSize;
    this.searchTasks(this.taskSearchValues); // neue Daten anzeigen
  }

  // Suche ein-/ausblenden
  toggleSearch(showSearch: boolean): void {

    this.showSearch = showSearch; // Speichern Sie es in einer lokalen Variablen, damit Sie es später in einem Cookie speichern können

    // Speichern Sie den aktuellen Wert in Cookies
    this.cookiesUtils.setCookie(this.cookieShowSearch, String(showSearch));
  }

  // Finden Sie alle Suchparameter von Cookies, um das gesamte Fenster wiederherzustellen
  initSearchCookie(): boolean {
    const cookie = this.cookiesUtils.getCookie(this.cookieTaskSeachValues);
    if (!cookie) { // Cookie wurde nicht gefunden
      return false;
    }
    const cookieJSON = JSON.parse(cookie);
    if (!cookieJSON) { // Das Cookie wurde nicht im JSON-Format gespeichert
      return false;
    }
    /*
    Es ist wichtig, hier eine neue Instanz zu erstellen, damit der Änderungsdetektor in der task.component erkennt,
    dass sich der Link geändert hat und meine Daten aktualisiert der Einfachheit halber gemacht
    */
    if (!this.taskSearchValues) {
      this.taskSearchValues = new TaskSearchValues();
    }

    // Seitengröße
    const tmpPageSize = cookieJSON.pageSize;
    if (tmpPageSize) {
      this.taskSearchValues.pageSize = Number(tmpPageSize); // Konvertieren Sie eine Zeichenfolge in eine Zahl
    }

    // ausgewählte Kategorie
    const tmpCategoryId = cookieJSON.categoryId;
    if (tmpCategoryId) {
      this.taskSearchValues.categoryId = Number(tmpCategoryId);
      this.selectedCategory = this.getCategoryFromArray(tmpCategoryId); // Schreiben Sie in die Variable, welche Kategorie ausgewählt wurde
    }

    // ausgewählte Priorität
    const tmpPriorityId = cookieJSON.priorityId as number;
    if (tmpPriorityId) {
      this.taskSearchValues.priorityId = Number(tmpPriorityId);
    }

    // Suchtext
    const tmpTitle = cookieJSON.title;
    if (tmpTitle) {
      this.taskSearchValues.title = tmpTitle;
    }

    // Aufgabenstatus – kann folgende Werte annehmen: null – alle, 0 – unvollendet, 1 – abgeschlossen
    const tmpCompleted = cookieJSON.completed as number;
    if (tmpCompleted >= 0) {
      this.taskSearchValues.completed = tmpCompleted;
    }

    // Spalte sortieren
    const tmpSortColumn = cookieJSON.sortColumn;
    if (tmpSortColumn) {
      this.taskSearchValues.sortColumn = tmpSortColumn;
    }

    // Sortierrichtung
    const tmpSortDirection = cookieJSON.sortDirection;
    if (tmpSortDirection) {
      this.taskSearchValues.sortDirection = tmpSortDirection;
    }

    // Datum aus
    const tmpDateFrom = cookieJSON.dateFrom;
    if (tmpDateFrom) {
      this.taskSearchValues.dateFrom = new Date(tmpDateFrom);
    }

    // Datum bis
    const tmpDateTo = cookieJSON.dateTo; // Name des Feldes in der Klasse mit einem Präfix
    if (tmpDateTo) {
      this.taskSearchValues.dateTo = new Date(tmpDateTo);
    }
    return true; // Das Cookie wurde gefunden und heruntergeladen
  }

  // findet den Index eines Elements (nach ID) in einem lokalen Array
  getCategoryFromArray(id: number): Category {
    const tmpCategory = this.categories.find(t => t.id === id);
    return tmpCategory;
  }

  // Laden Sie ein Cookie, um die Sprache der Benutzeroberfläche festzulegen
  initLangCookie(): void {

    const val = this.cookiesUtils.getCookie(this.cookieLang);
    if (val) { // wenn das Cookie gefunden wird
      this.translate.use(val); // Sprache wechseln
    } else {
      this.translate.use(LANG_EN);
    }

  }

  // Cookies laden – Menü anzeigen oder nicht
  initShowMenuCookie(): void {
    const val = this.cookiesUtils.getCookie(this.cookieShowMenu);
    if (val) { // wenn das Cookie gefunden wird
      this.menuOpened = (val === 'true'); // Konvertierung von einem String in einen booleschen Wert
    }
  }

  // Cookies laden – Suche anzeigen oder nicht
  initShowSearchCookie(): void {
    const val = this.cookiesUtils.getCookie(this.cookieShowSearch);
    if (val) { // wenn das Cookie gefunden wird
      this.showSearch = (val === 'true'); // Konvertierung von einem String in einen booleschen Wert
    }

  }

  // Cookies laden – Statistiken anzeigen oder nicht
  initShowStatCookie(): void {
    if (!this.isMobile) { // wenn mobil Gerät, dann werden keine Statistiken angezeigt
      const val = this.cookiesUtils.getCookie(this.cookieShowStat);
      if (val) { // wenn das Cookie gefunden wird
        this.showStat = (val === 'true'); // Konvertierung von einem String in einen booleschen Wert
      }
    }
  }

  // Wurden die Anwendungseinstellungen geändert?
  settingsChanged(priorities: Priority[]): void { // priorities - geänderte Prioritätenliste

    this.priorities = priorities; // wir erhalten ein modifiziertes Array mit Prioritäten
    this.searchTasks(this.taskSearchValues); // Aktualisieren Sie aktuelle Aufgaben und Kategorien zur Anzeige

    // Speichern Sie die aktuell ausgewählte Sprache in Cookies
    this.cookiesUtils.setCookie(this.cookieLang, this.translate.currentLang);
  }
}


