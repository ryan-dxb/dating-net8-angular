import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  model: {
    username: string,
    password: string
  } = {
    username: '',
    password: ''
  };

  constructor() { }

  login() {
    console.log(this.model);
  }
}
