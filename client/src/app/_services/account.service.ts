import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root',
})

// Services are singletons, so we don't need to use the decorator
// We can inject this service into any component or other service
export class AccountService {
  baseUrl = 'http://localhost:5001/api/';
  private currentUserSource = new BehaviorSubject<User | null>(null);
  // BehaviorSubject is a type of Subject that allows us to set the initial value

  // We can subscribe to this observable from any component
  // We can also emit new values to the observable
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) {}

  setCurrentUser(user: User | null) {
    this.currentUserSource.next(user); // Emit the user to the observable
  }

  login(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      // We can use the pipe operator to chain rxjs operators
      // The map operator allows us to transform the data
      // We can use the tap operator to inspect the data
      // tap(user => {
      //   console.log(user);
      // })

      map((response: User) => {
        const user = response;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user)); // Store user in local storage
          // this.currentUserSource.next(user); // Emit the user to the observable
          this.setCurrentUser(user);
        }
      })
    );
  }

  register(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
      map((user: User) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user)); // Store user in local storage
          // this.currentUserSource.next(user); // Emit the user to the observable
          this.setCurrentUser(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('user'); // Remove user from local storage
    // this.currentUserSource.next(null); // Emit null to the observable
    this.setCurrentUser(null);
  }
}
