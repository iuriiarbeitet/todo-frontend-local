import {CommonDAO} from './CommonDAO';
import {Observable} from 'rxjs';
import {CategorySearchValues} from '../search/SearchObjects';
import {Category} from '../../../model/Category';

export interface CategoryDAO extends CommonDAO<Category> {

    findCategories(categorySearchValues: CategorySearchValues): Observable<Category[]>;

}
