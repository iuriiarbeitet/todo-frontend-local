import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-stat-card',
    templateUrl: './stat-card.component.html',
    styleUrls: ['./stat-card.component.css']
})

// "presentational component": zeigt empfangene Daten an
// Karte zur Anzeige von Statistiken
export class StatCardComponent implements OnInit {

    @Input()
    completed = false;

    @Input()
    iconName: string;

    @Input()
    count1: any;

    @Input()
    count2: any;

    @Input()
    title: string;

    constructor() {
    }

    ngOnInit(): void {
    }

}
