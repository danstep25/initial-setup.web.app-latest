import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { urlInterceptor } from './app/url/url.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';

const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([urlInterceptor])),
    provideHttpClient(),
    provideAnimations(),
    provideRouter(routes),
    provideNativeDateAdapter()
  ]
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
