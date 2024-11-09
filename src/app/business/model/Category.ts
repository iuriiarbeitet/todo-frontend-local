import {User} from '../../auth/service/auth.service';

export class Category {
    id: number;
    title: string;
    completedCount: number;
    uncompletedCount: number;
    user: User;

    // ? означает необязательный для передачи параметр
    constructor(id: number, title: string, user: User, completedCount?: number,  uncompletedCount?: number) {
        this.id = id;
        this.title = title;
        this.completedCount = completedCount;
        this.uncompletedCount = uncompletedCount;
        this.user = user;
    }
}
