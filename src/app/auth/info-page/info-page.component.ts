import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';

/*

Страница для показа текстовой информации (статуса).
Чаще всего - результат выполнения какой-либо операции пользователя.

 */

@Component({
  selector: 'app-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.css']
})
export class InfoPageComponent implements OnInit {

  msg: string; // текст для отображения на странице
  isMobile: boolean; // зашли на сайт с мобильного устройства или нет?


  // внедрение всех нужных объектов
  constructor(
    private route: ActivatedRoute, // текущий роут, куда уже перешли (можно считывать данные, например параметры)
    private deviceService: DeviceDetectorService // с какого устойства зашли

  ) {
  }

  ngOnInit(): void { // вызывается при инициализации компонента (до отображения внешнего вида)

    this.isMobile = this.deviceService.isMobile();

    // считываем из параметра переданный текст для его отображения на странице
    this.route.params.subscribe(params => { // т.к. params - это Observable - подписываемся и получаем значения
      this.msg = params.msg;
    });

  }

}
