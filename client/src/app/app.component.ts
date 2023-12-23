import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'client';
  users: any;

  // OnInit is a lifecycle method that runs when the component is initialized or after the constructor is called

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get("http://localhost:5001/api/users").subscribe({
      next: (response) => {
        console.log('Here is the response: ', response);

        this.users = response;
      },
      error: (error) => {
        console.error('There was an error!', error);
      },
      complete: () => {
        console.log('There was an error!');
      }
    })};

}
