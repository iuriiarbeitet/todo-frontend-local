import {Component, Input, OnInit} from '@angular/core';
import {DashboardData} from '../../../object/DashboardData';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
    selector: 'app-stat',
    templateUrl: './stat.component.html',
    styleUrls: ['./stat.component.css'],
    animations: [

        trigger('statRegion', [
            state('show', style({
                overflow: 'hidden',
                height: '*',
                opacity: '10',
            })),
            state('hide', style({
                opacity: '0',
                overflow: 'hidden',
                height: '0px',
            })),
            transition('* => *', animate('300ms ease-in-out'))
        ])
    ]
})

// "presentational component": zeigt die empfangenen Daten an und sendet alle Aktionen an den Handler
// Zweck - Statistiken anzeigen
export class StatComponent implements OnInit {

    // ----------------------- eingehende Parameter ----------------------------
    @Input()
    dash: DashboardData; // Dashboard-Daten

    @Input('showStat')
    set setShowStat(show: boolean) { // Statistiken ein- oder ausblenden
        this.showStatistics = show;
        this.initStatDash(); // Jedes Mal, wenn sich der Wert ändert, wird die Animation ein-/ausgeblendet
    }

    showStatistics: boolean;
    animationState: string; // zum Ausblenden/Einblenden von Animationen

    constructor() {
    }

    ngOnInit(): void {
    }

    getTotal(): number {
        if (this.dash) {
            return this.dash.completedTotal + this.dash.uncompletedTotal; // Fassen Sie erledigte und noch nicht erledigte Aufgaben zusammen
        }
    }

    getCompletedCount(): number {
        if (this.dash) {
            return this.dash.completedTotal;
        }
    }

    getUncompletedCount(): number {
        if (this.dash) {
            return this.dash.uncompletedTotal;
        }
    }

    getCompletedPercent(): number {
        if (this.dash) {
            return this.dash.completedTotal ? (this.dash.completedTotal / this.getTotal()) : 0;
        }
    }

    getUncompletedPercent(): number {
        if (this.dash) {
            return this.dash.uncompletedTotal ? (this.dash.uncompletedTotal / this.getTotal()) : 0;
        }
    }

    initStatDash(): void {
        if (this.showStatistics) {
            this.animationState = 'show';
        } else {
            this.animationState = 'hide';
        }
    }
}
