import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService, User} from '../service/auth.service';
import {DeviceDetectorService} from 'ngx-device-detector';


/*

Страница для регистрации нового пользователя.

 */

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form: FormGroup; // форма с введенными данными
  isLoading = false; // идет ли загрузка в данный момент (для показа/скрытия индикатора загрузки)
  error: string; // текст ошибки от сервера (если есть)
  firstSubmitted = false; // становится true при первом нажатии (чтобы сразу не показывать ошибки полей, а только после первой попытки)
  isMobile: boolean; // зашли на сайт с мобильного устройства или нет?


  // внедрение всех нужных объектов
  constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute, // текущий роут, куда уже перешли (можно считывать данные, например параметры)
      private router: Router, // для навигации, перенаправления на другие страницы
      private authService: AuthService, // сервис аутентификации
      private deviceService: DeviceDetectorService, // для определения типа устройства

  ) {
  }


  ngOnInit(): void { // вызывается при инициализации компонента (до отображения внешнего вида)

    this.isMobile = this.deviceService.isMobile();

    // инициализация формы с нужными полями, начальными значениями и валидаторами
    this.form = this.formBuilder.group({
      username: ['', [Validators.required]], // Validators.required - проверка на обязательность заполнения
      email: ['', [Validators.required, Validators.email]], // Validators.email - проверка правильности введенного email
      password: ['', [Validators.required, Validators.minLength(6)]], // пароль - не меньше 6 символов
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]] // повторно должен ввести пароль, чтобы не ошибиться
    });

  }

  // ссылка на компоненты формы (для сокращения кода, чтобы каждый раз не писать this.form.get('') )
  get usernameField(): AbstractControl {
    return this.form.get('username');
  }

  get emailField(): AbstractControl {
    return this.form.get('email');
  }

  get passwordField(): AbstractControl {
    return this.form.get('password');
  }

  get confirmPasswordField(): AbstractControl {
    return this.form.get('confirmPassword');
  }


  // попытка отправки данных формы регистрации
  public submitForm(): void {

    this.firstSubmitted = true; // один раз нажали на отправку формы (можно теперь показывать ошибки)

    if (this.form.invalid) { // если есть хотя бы одна ошибка в введенных данных формы
      return; // не отправляем данные на сервер
    }

    this.isLoading = true; // показываем индикатор загрузки

    // объект для отправки на сервер (добавляется в тело запроса)
    const user = new User();
    user.username = this.usernameField.value;
    user.email = this.emailField.value;
    user.password = this.passwordField.value;

    // отправка запроса на сервер
    this.authService.register(user).subscribe(
        () => { // запрос успешно выполнился без ошибок

          this.isLoading = false; // скрыть индикатор загрузки

          this.error = null; // если до этого показывалась ошибка на странице - скрываем ее

          // показываем пользователю информацию на новой странице
          this.router.navigate(['/info-page',{msg: 'An email has been sent to confirm your account. Check your email in 1-2 minutes.'}]);

        },
        err => { // запрос выполнился с ошибкой (можем использовать переменную err)
          this.isLoading = false; // скрыть индикатор загрузки


          switch (err.error.exception) { // считываем тип ошибки, чтобы правильно среагировать

            case 'DataIntegrityViolationException': { // при добавлении данных - произошла ошибка целостности (неверный внешний ключ)
              this.error = `User or email already exists`; // будет показана ошибка на странице
              break;
            }


            case 'ConstraintViolationException': {  // при добавлении данных - произошла ошибка уникальности строки
              this.error = `User or email already exists`; // будет показана ошибка на странице
              break;
            }

            case 'UserOrEmailAlreadyExistException': {
              this.error = `User or email already exists`; // будет показана ошибка на странице
              break;
            }

            default: { // если любой другой тип ошибки - просто показать информацию
              this.error = `Error`; // будет показана ошибка на странице
              break;
            }

          }

        });
  }
}


