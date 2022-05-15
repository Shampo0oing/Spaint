import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ImgurService } from './imgur.service';
// tslint:disable: no-magic-numbers
describe('ImgurService', () => {
    let service: ImgurService;
    let canvasTestHelper: CanvasTestHelper;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ImgurService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('uploadImage should forward call to append and post', () => {
        const appendSpy = spyOn(FormData.prototype, 'append').and.stub();
        service.uploadImage(canvasTestHelper.canvas, 'test');
        expect(appendSpy).toHaveBeenCalled();
    });

    it('getAccessToken should forward call to append 4 times', () => {
        const appendSpy = spyOn(FormData.prototype, 'append').and.stub();
        service.getAccessToken();
        // tslint:disable-next-line:no-magic-numbers
        expect(appendSpy).toHaveBeenCalledTimes(4);
    });
});
