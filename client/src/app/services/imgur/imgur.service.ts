import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ImgurService {
    constructor(private http: HttpClient) {}
    accessToken: string = 'vide';

    uploadImage(canvas: HTMLCanvasElement, extension: string): Observable<{ data: { link: string } }> {
        const data = new FormData();
        data.append('image', canvas.toDataURL('image/' + extension).replace(`data:image/${extension};base64,`, ''));
        return this.http.post<{ data: { link: string } }>('https://api.imgur.com/3/image', data, {
            headers: {
                Authorization: 'Bearer ' + this.accessToken,
            },
        });
    }

    // getAccessToken(): Observable<string> {
    //     return this.indexService.getAccessToken();
    // }
}
