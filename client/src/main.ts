import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}
// prevent ctrl + wheel (zoom in/zoom out)
document.addEventListener(
    'wheel',
    (event) => {
        if (event.ctrlKey) {
            event.preventDefault();
        }
    },
    { passive: false },
);
// prevent ctrl + and ctrl - (zoom in/zoom out)
document.addEventListener(
    'keydown',
    (event) => {
        if (event.ctrlKey && (event.key === '+' || event.key === '-')) event.preventDefault();
    },
    { passive: false },
);

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
