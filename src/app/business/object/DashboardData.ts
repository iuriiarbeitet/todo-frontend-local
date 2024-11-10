// Daten zur Anzeige eines Dashboards mit Statistiken oben auf der Seite
export class DashboardData {

    // Diese beiden Variablen reichen für alle allgemeinen Statistiken aus
    completedTotal: number;
    uncompletedTotal: number;

    constructor(completedTotal?: number, uncompletedTotal?: number) {
        this.completedTotal = completedTotal;
        this.uncompletedTotal = uncompletedTotal;
    }
}
