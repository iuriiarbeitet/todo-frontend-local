import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';


/*

Interceptor - перехватывает все исходящие запросы - можно изменять данные перед отправкой

 */
@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor() {
  }

// метод будет выполняться при каждом исходящем запросе на backend
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


    request = request.clone({
      withCredentials: true // разрешить отправку куков на backend
    });



    console.log(request);



    // когда пользователь ввел новый пароль и отправил его на backend - тогда мы вручную добавляем токен
    if (request.url.includes('update-password')) {  // если запрос идет на обновление пароля - для него спец. обработка токена

      const token = request.params.get('token'); // получаем токен из параметра запроса
      request.params.delete('token');   // удаляем параметр, т.к. он больше не нужен

      request = request.clone({
        setHeaders: ({
          // добавляем токен в заголовок Authorization (не используем кук, этот токен будет отправлен на сервер только 1 раз,
          // чтобы выполнить обновление пароля)
          Authorization: 'Bearer ' + token
        })
      });
    }

    return next.handle(request); // отправляем исходящий запрос дальше на backend


  }




}
