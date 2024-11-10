// alle möglichen Suchparameter für Kategorien
export class CategorySearchValues {
    title: string = null;
    email: string = null; // Filtern nach einem bestimmten Benutzer
}

// alle möglichen Prioritätssuchparameter
export class PrioritySearchValues {
    title: string = null;
    email: string = null; // Filtern nach einem bestimmten Benutzer
}

// alle möglichen Suchparameter für Kategorien
export class TaskSearchValues {

    // Standard-Anfangswerte (null setzen, damit es keinen undefinierten Wert gibt)
    title = '';
    completed: number = null;
    priorityId: number = null;
    categoryId: number = null;

    dateFrom: Date = null;
    dateTo: Date = null;

    email: string = null;
    pageNumber = 0;
    pageSize = 5;

    // Sortierung
    sortColumn = 'title';
    sortDirection = 'asc';

}
