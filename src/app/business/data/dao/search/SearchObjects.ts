// все возможные параметры поиска категорий
export class CategorySearchValues {
    title: string = null;
    email: string = null; // фильтрация для конкретного пользователя
}

// все возможные параметры поиска приоритетов
export class PrioritySearchValues {
    title: string = null;
    email: string = null; // фильтрация для конкретного пользователя
}

// все возможные параметры поиска категорий
export class TaskSearchValues {

    // начальные значения по-умолчанию (задаем null, чтобы не было значение undefined)
    title = '';
    completed: number = null;
    priorityId: number = null;
    categoryId: number = null;

    dateFrom: Date = null; // только дата, без времени
    dateTo: Date = null; // только дата, без времени

    email: string = null; // фильтрация для конкретного пользователя
    pageNumber = 0; // 1-я страница (значение по-умолчанию)
    pageSize = 5; // сколько элементов на странице (значение по-умолчанию)

    // сортировка
    sortColumn = 'title';
    sortDirection = 'asc';

}
