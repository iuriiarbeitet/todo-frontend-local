import {Priority} from './Priority';
import {Category} from './Category';
import {User} from '../../auth/service/auth.service';

export class Task {
  id: number;
  title: string;
  completed: number; // вместо boolean, чтобы удобный было записывать в БД
  priority: Priority;
  category: Category;
  taskDate?: Date;
  user: User; // чтобы знать, для какого пользователя добавляем задачу

  // сюда будет записывать старое значение,
// которое изменили на новое (нужно для правильного обновления счетчиков категорий -
// сначала обновляем стат-ку старой категории, затем новой)
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
