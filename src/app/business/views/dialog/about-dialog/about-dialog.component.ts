import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-about-dialog',
    templateUrl: './about-dialog.component.html',
    styleUrls: ['./about-dialog.component.css']
})

// Dialogfeld, in dem das Programm beschrieben wird
export class AboutDialogComponent implements OnInit {

    dialogTitle: string;
    message: string;

    constructor(
        private dialogRef: MatDialogRef<AboutDialogComponent>, // um mit dem aktuellen Dialogfenster zu arbeiten
        @Inject(MAT_DIALOG_DATA) private data: { dialogTitle: string, message: string } // Daten, die an das Dialogfeld übergeben wurden
    ) {
        this.dialogTitle = data.dialogTitle;
        this.message = data.message;
    }

    ngOnInit(): void {
    }


    confirm(): void {
        this.dialogRef.close(true);
    }

}
