import {Component, Inject, OnInit} from '@angular/core';
import {DialogAction, DialogResult} from '../../../object/DialogResult';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.css']
})

// Bestätigungsdialogfeld
export class ConfirmDialogComponent implements OnInit {
    dialogTitle: string;
    message: string;

    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogComponent>, // um mit dem aktuellen Dialogfenster zu arbeiten
        @Inject(MAT_DIALOG_DATA) private data: { dialogTitle: string, message: string } // Daten, die an das Dialogfeld übergeben wurden
    ) {
        this.dialogTitle = data.dialogTitle;
        this.message = data.message;
    }

    ngOnInit() {
    }

    confirm(): void {
        this.dialogRef.close(new DialogResult(DialogAction.OK));
    }

    cancel(): void {
        this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
    }
}

