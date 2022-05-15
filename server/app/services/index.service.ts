import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ImgurService } from '../services/imgur.service';

@injectable()
export class IndexService {
    constructor(@inject(TYPES.DateService) @inject(TYPES.ImgurService) private imgurService: ImgurService) {}

    validate(name: string, tags: string[]): boolean {
        const maxTagsNumber = 10;
        let maxTagSize = true;
        for (const tag of tags) {
            maxTagSize = maxTagSize && /^[^\W_]{0,10}$/.test(tag);
        }
        return /^[^\W_]{1,10}$/.test(name) && maxTagSize && tags.length <= maxTagsNumber;
    }

    async uploadOnImgur(image: string, name: string, description: string): Promise<{ name: string; description: string; link: string }> {
        let img = { name: '', description: '', link: '' };
        try {
            img = await this.imgurService.uploadImage(image, name, description);
        } catch (error) {
            console.error(error);
        }
        return img;
    }
    async addImgurImageToAlbum(imageIds: string, albumHash: string): Promise<void> {
        return await this.imgurService.addImageToAlbum(imageIds, albumHash);
    }

    async creatAlbumImgur(): Promise<{ id: string; deleteHash: string }> {
        return await this.imgurService.creatAlbum();
    }

    async getAllImages(albumHash: string): Promise<{ id: string; name: string; tags: string; link: string }[]> {
        return await this.imgurService.getAllImages(albumHash);
    }

    async deleteImgurImage(imageId: string): Promise<string> {
        return await this.imgurService.deleteImgurImage(imageId);
    }

    async deleteAllImgurImages(imageIds: string): Promise<void> {
        return await this.imgurService.deleteAllImages(imageIds);
    }
}
