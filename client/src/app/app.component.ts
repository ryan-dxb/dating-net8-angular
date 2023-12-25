import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'client';
  users: any;

  // OnInit is a lifecycle method that runs when the component is initialized or after the constructor is called

  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.getUsers();
    this.setCurrentUser();
  }

  getUsers() {
    this.http.get('http://localhost:5001/api/users').subscribe({
      next: (response) => {
        console.log('Here is the response: ', response);

        this.users = response;
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
    });
  }

  setCurrentUser() {
    const userString = localStorage.getItem('user');

    if (userString) {
      const userObj: User = JSON.parse(userString);

      console.log('Here is the user object: ', userObj);

      this.accountService.setCurrentUser(userObj);
    } else {
      console.log('There is no user in local storage!');
      this.accountService.setCurrentUser(null);
    }
  }
}
