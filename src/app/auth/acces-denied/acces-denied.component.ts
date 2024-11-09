import {Component, OnInit} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-acces-denied',
  templateUrl: './acces-denied.component.html',
  styleUrls: ['./acces-denied.component.css']
})
export class AccessDeniedComponent implements OnInit {

  isMobile: boolean;

  constructor(
    private deviceService: DeviceDetectorService
  ) {
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();
  }
}
