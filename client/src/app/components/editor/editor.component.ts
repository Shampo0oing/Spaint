import { Component, OnInit } from '@angular/core';
import { AnnulerRefaireService } from '@app/services/annuler-refaire/annuler-refaire.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit {
    constructor(private annulerRefaireService: AnnulerRefaireService) {}

    ngOnInit(): void {
        this.annulerRefaireService.emptyBothActionArray();
    }
}
