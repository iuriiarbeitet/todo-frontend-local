import {CommonDAO} from './CommonDAO';
import {Observable} from 'rxjs';
import {TaskSearchValues} from '../search/SearchObjects';
import { Task } from '../../../model/Task';

export interface TaskDAO extends CommonDAO<Task> {

    findTasks(taskSearchValues: TaskSearchValues): Observable<Task[]>;


}
