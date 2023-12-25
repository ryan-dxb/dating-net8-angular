import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  // Send data from child to parent component
  // We can use the @Output decorator to emit data from the child component
  // We can use the EventEmitter class to emit events
  // We can use the @ViewChild decorator to get a reference to the child component

  @Output() cancelRegister = new EventEmitter();

  model: {
    username?: string;
    password?: string;
  } = {};

  constructor(
    private accountService: AccountService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {}

  register() {
    this.accountService.register(this.model).subscribe({
      next: (response) => {
        console.log(response);
        this.cancel();
        this.toastr.success('Registration successful');
      },
      error: (error) => {
        console.log(error);
        this.toastr.error(error.error);
      },
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
}
