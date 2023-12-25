import { Component, OnInit } from '@angular/core';
import { Member } from '../../_models/member';
import { MembersService } from '../../_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.css',
})
export class MemberListComponent implements OnInit {
  members: Member[] = [];

  constructor(private memberService: MembersService) {}

  ngOnInit() {}

  loadMembers() {
    this.memberService.getMembers().subscribe({
      next: (members: Member[]) => {
        this.members = members;
      },
    });
  }
}