import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../service/auth.service';
import {DeviceDetectorService} from 'ngx-device-detector';


/**
Страница, при переходе на которую производится активация аккаунта.
Эту страницу пользователь открывает по ссылке из письма - соответственно сразу нужно отправлять запрос активации на сервер.
 */

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent implements OnInit {

  showResendLink = false; // показать ссылку на повторную отправку письма активации
  uuid: string; // uuid пользователя для его активации
  isLoading = false; // идет ли загрузка в данный момент (для показа/скрытия индикатора загрузки)
  error: string; // текст ошибки от сервера (если есть)
  firstSubmitted = false; // становится true при первом нажатии (чтобы сразу не показывать ошибки полей, а только после первой попытки)
  form: FormGroup; // форма с введенными пользователем данными
  isMobile: boolean; // зашли на сайт с мобильного устройства или нет?



  // внедрение всех нужных объектов
  constructor(
    private formBuilder: FormBuilder, // для создание формы
    private route: ActivatedRoute, // текущий роут, куда уже перешли (можно считывать данные, например параметры)
    private authService: AuthService, // сервис аутентификации
    private router: Router, // для навигации, перенаправления на другие страницы
    private deviceService: DeviceDetectorService // для определения устройства
  ) {
  }

  ngOnInit(): void { // вызывается при инициализации компонента (до отображения внешнего вида)

    this.isMobile = this.deviceService.isMobile();

    // инициализация формы с нужными полями, начальными значениями и валидаторами
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]] // Validators.email - проверка правильности введенного email
    });

    // при загрузке страницы - сразу отправляем запрос на активацию пользователя
    this.route.params.subscribe(params => { // т.к. params - это Observable - подписываемся и получаем значения
      this.uuid = params.uuid; // считываем uuid пользователя, которого хотим активировать

      if (this.uuid === 'error'){
        this.showResendLink = true;
        return;
      }
      this.isLoading = true; // показать индикатор загрузки

      // отправка запроса на сервер
      this.authService.activateAccount(this.uuid).subscribe(
        result => { // запрос успешно выполнился без ошибок

          this.isLoading = false; // скрыть индикатор загрузки

          if (result) {
            // показываем пользователю информацию на новой странице
            this.router.navigate(['/info-page', {msg: 'Your account has been successfully activated.'}]);
          } else {
            //  false - что-то пошло не так
            this.router.navigate(['/info-page', {msg: 'Your account is not activated. Try again.'}]);
          }

        }
        ,
        err => { // запрос выполнился с ошибкой (можем использовать переменную err)

          this.isLoading = false; // скрыть индикатор загрузки

          switch (err.error.exception) { // считываем тип ошибки, чтобы правильно среагировать

            case 'UserAlreadyActivatedException': { // пользователь уже был активирован

              // показываем пользователю информацию на новой странице
              this.router.navigate(['/info-page', {msg: 'Your account has already been activated previously.'}]);
              break;
            }

            default: {
              this.error = `Activation error. Try sending yourself the email again.`;
              this.showResendLink = true;
              break;
            }

          }


        }
      );

    });
  }

  // ссылка на компонент формы (для сокращения кода, чтобы каждый раз не писать this.form.get('') )
  get emailField(): AbstractControl {
    return this.form.get('email');
  }

  // попытка отправки данных формы
  public submitForm(): void {

    this.firstSubmitted = true; // один раз нажали на отправку формы (теперь можно показывать ошибки)

    if (this.form.invalid) { // если есть хотя бы одна ошибка в введенных данных формы
      return; // не отправляем данные на сервер
    }

    this.isLoading = true; // показать индикатор загрузки

    // отправка запроса на сервер
    this.authService.resendActivateEmail(this.emailField.value).subscribe(
      () => {

        this.isLoading = false; // скрыть индикатор загрузки

        // показываем пользователю информацию на новой странице
        this.router.navigate(['/info-page', {msg: 'An activation email has been sent to you.'}]);


      },
      err => { // запрос выполнился с ошибкой (можем использовать переменную err)

        this.isLoading = false; // скрыть индикатор загрузки

        switch (err.error.exception) { // считываем тип ошибки, чтобы правильно среагировать

          case 'UserAlreadyActivatedException': { // пользователь уже был активирован ранее

            // показываем пользователю информацию на новой странице
            this.router.navigate(['/info-page', {msg: 'Your account has already been activated previously.'}]);

            break;
          }

          case 'UsernameNotFoundException': { // пользователь или email не был найден
            this.error = 'User with this email not found'; // будет показана ошибка на странице
            break;
          }

          default: { // если любой другой тип ошибки - просто показать информацию
            this.error = `Error`; // будет показана ошибка на странице
            break;
          }

        }


      }
    );
  }


}

