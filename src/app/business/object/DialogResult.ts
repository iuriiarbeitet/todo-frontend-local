// Wird in Dialogfeldern verwendet, in denen es viele Aktionen mit einem Ergebnis geben kann, nicht nur „OK“ und „Abbrechen“.


export class DialogResult {
    action: DialogAction;
    obj: any; // zur Übergabe von Parametern, Objekten


    // ? bedeutet optionaler Parameter
    constructor(action: DialogAction, obj?: any) {
        this.action = action;
        this.obj = obj;
    }
}

// alle möglichen Aktionen im Dialogfeld (können in verschiedene unterteilt werden, enum)
export enum DialogAction {
    SETTINGS_CHANGE, // Einstellungen wurden geändert
    SAVE, // Speichern von Änderungen
    OK, // um Aktionen zu bestätigen
    CANCEL, // Alle Aktionen abbrechen
    DELETE, // Löschen eines Objekts
    COMPLETE, // eine Aufgabe erledigen
    ACTIVATE// Zurücksetzen der Aufgabe in den aktiven Zustand (ungelöst)
}
