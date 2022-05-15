import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { IndexService } from '@app/services/index/index.service';

@Component({
    selector: 'app-save-draw',
    templateUrl: './save-draw.component.html',
    styleUrls: ['./save-draw.component.scss'],
})
export class SaveDrawComponent {
    constructor(public dialog: MatDialog, public drawingService: DrawingService, public indexService: IndexService, private snackBar: MatSnackBar) {}
    nomDessin: string = '';
    readonly separatorKeysCodes: number[] = [ENTER, SPACE];
    tags: string[] = [];
    maxTags: number = 10;
    disabled: boolean = false;

    nameFormControl: FormControl = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+$')]);
    tagFormControl: FormControl = new FormControl('', [Validators.pattern('^[a-zA-Z0-9]+$')]);

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim() && this.tags.length < this.maxTags && value.match(/^([a-zA-Z0-9])+$/))
            if (!this.tags.includes(value.trim())) this.tags.push(value.trim());

        if (input && value.match(/^([a-zA-Z0-9])+$/)) input.value = '';
    }

    remove(tags: string): void {
        const index = this.tags.indexOf(tags);
        if (index < 0) return;
        this.tags.splice(index, 1);
    }

    tryToUploadCanvas(name: string): void {
        this.disabled = true;
        const albumHash = this.drawingService.localStorage.getItem('imgur/album');
        if (!albumHash) {
            this.indexService.createAlbum().subscribe(
                (res) => {
                    this.drawingService.localStorage.setItem('imgur/album', res.id);
                    this.uploadCanvas(name, res.id);
                },
                (err) => {
                    console.error(err);
                    this.disabled = false;
                },
            );
        } else {
            this.uploadCanvas(name, albumHash);
        }
    }

    uploadCanvas(name: string, albumHash: string): void {
        this.indexService.uploadOnImgur(this.drawingService.canvas, 'jpeg', name, this.tags).subscribe(
            (res) => {
                this.indexService.addImageToAlbum(res.id, albumHash).subscribe(
                    () => this.openSnackbar('Le dessin a bien été sauvegardé sur le serveur'),
                    (err) => {
                        this.openSnackbar("Le dessin n'a pas pu être sauvegardé, echec de l'accès a votre album Imgur");
                        this.indexService.deleteImage(res.id).subscribe((img) => console.log(img));
                        console.error(err);
                    },
                );
            },
            (err) => {
                const statusNotAcceptable = 406;
                const imgurError = 503;
                let msg: string;
                switch (err.status) {
                    case statusNotAcceptable:
                        msg = "Le dessin n'a pas pu être sauvegarder, veuillez entrer un Nom et des Tags correct";
                        break;
                    case imgurError:
                        msg = "Le dessin n'a pas pu être sauvegarder, Imgur est indisponible pour lemomeent";
                        break;
                    default:
                        msg = `Le dessin n'a pas pu être sauvegarder: ${err.statusText}`;
                }
                this.openSnackbar(msg);
                this.closeDialog();
            },
            () => {
                this.closeDialog();
                this.disabled = false;
            },
        );
    }

    closeDialog(): void {
        this.drawingService.dialogOpen = false;
        this.dialog.closeAll();
    }

    openSnackbar(message: string): void {
        this.snackBar.open(message, "J'ai compris", {
            duration: 5000,
            verticalPosition: 'top',
            panelClass: ['dark-snackbar'],
        });
    }
}
