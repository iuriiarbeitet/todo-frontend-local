import {Priority} from './Priority';
import {Category} from './Category';
import {User} from '../../auth/service/auth.service';

export class Task {
  id: number;
  title: string;
  completed: number; // anstelle von boolean, um das Schreiben in die Datenbank zu erleichtern
  priority: Priority;
  category: Category;
  taskDate?: Date;
  user: User; // um zu wissen, für welchen Benutzer wir eine Aufgabe hinzufügen

  /*
    der alte Wert wird hier geschrieben, was in ein neues geändert wurde (notwendig für die korrekte Aktualisierung der Kategoriezähler -
    aktualisiere zuerst die Statistiken der alten Kategorie, dann der neuen)
   */
  oldCategory: Category;

  constructor(id: number, title: string, completed: number, priority: Priority, category: Category, user: User, taskDate?: Date) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.priority = priority;
    this.category = category;
    this.taskDate = taskDate;
    this.user = user;
  }
}
