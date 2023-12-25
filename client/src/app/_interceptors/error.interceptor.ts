import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // Handle 401 Unauthorized responses using the error interceptor
  const handle401 = () => {
    // Redirect to login page
    router.navigate(['/login'], { queryParams: { returnUrl: req.url } });
    // Display toastr notification
    toastr.error('Unauthorized');
  };

  // Handle 403 Forbidden responses using the error interceptor
  const handle403 = () => {
    // Redirect to home page
    router.navigate(['/']);
    // Display toastr notification
    toastr.error('Forbidden');
  };

  // Handle 404 Not Found responses using the error interceptor
  const handle404 = () => {
    // Redirect to home page
    router.navigate(['/']);
    // Display toastr notification
    toastr.error('Not Found');
  };

  // Handle 500 Internal Server Error responses using the error interceptor
  const handle500 = () => {
    // Redirect to home page
    router.navigate(['/']);
    // Display toastr notification
    toastr.error('Internal Server Error');
  };

  // Handle 503 Service Unavailable responses using the error interceptor
  const handle503 = () => {
    // Redirect to home page
    router.navigate(['/']);
    // Display toastr notification
    toastr.error('Service Unavailable');
  };

  return next(req).pipe(
    catchError((error) => {
      // Handle 401 Unauthorized responses
      switch (error.status) {
        case 401:
          handle401();
          break;
        case 403:
          handle403();
          break;
        case 404:
          handle404();
          break;
        case 500:
          handle500();
          break;
        case 503:
          handle503();
          break;
      }

      return throwError(() => error);
    })
  );
};
