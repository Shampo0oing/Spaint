import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Drawing } from '@app/classes/Database/drawing';
import { Message } from '@common/communication/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class IndexService {
    private readonly BASE_URL: string = 'http://localhost:3000/api/index';

    constructor(private http: HttpClient) {}

    basicGet(): Observable<Message> {
        return this.http.get<Message>(this.BASE_URL).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<void> {
        return this.http.post<void>(this.BASE_URL + '/send', message).pipe(catchError(this.handleError<void>('basicPost')));
    }

    uploadCanvas(canvas: HTMLCanvasElement, drawingName: string, drawingTags: string[] = []): Observable<void> {
        return this.http.put<void>(this.BASE_URL + '/canvas/upload', {
            canvasImage: canvas.toDataURL('image/jpeg'),
            name: drawingName,
            tags: drawingTags,
        });
    }

    uploadOnImgur(
        canvas: HTMLCanvasElement,
        extension: string = 'jpeg',
        name: string = 'Picasso',
        tags: string[] = [''],
    ): Observable<{ name: string; description: string; link: string; id: string }> {
        return this.http.put<{ name: string; description: string; link: string; id: string }>(this.BASE_URL + '/canvas/imgur/upload', {
            image: canvas.toDataURL('image/' + extension).replace(`data:image/${extension};base64,`, ''),
            name,
            description: tags,
        });
    }

    createAlbum(): Observable<{ id: string; deleteHash: string }> {
        return this.http.post<{ id: string; deleteHash: string }>(this.BASE_URL + '/canvas/imgur/album/create', {});
    }

    addImageToAlbum(imageIds: string, albumHash: string): Observable<void> {
        return this.http.post<void>(this.BASE_URL + '/canvas/imgur/album/add', {
            imageIds,
            albumHash,
        });
    }

    getAllImages(albumHash: string): Observable<Drawing[]> {
        return this.http.get<Drawing[]>(this.BASE_URL + '/canvas/imgur/album/images', {
            params: {
                albumHash,
            },
        });
    }

    deleteImage(imageId: string): Observable<string> {
        return this.http.delete<string>(this.BASE_URL + '/canvas/imgur/image/delete', {
            params: {
                imageId,
            },
        });
    }

    deleteAllImages(imageIds: string): Observable<void> {
        return this.http.delete<void>(this.BASE_URL + '/canvas/imgur/image/deleteAll', {
            params: {
                imageIds,
            },
        });
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return (error: Error): Observable<T> => {
            return of(result as T);
        };
    }
}
