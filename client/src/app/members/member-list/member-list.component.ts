import { Component, inject, OnInit } from '@angular/core';
import { Member } from 'src/app/_models/member';
import { UserParams } from 'src/app/_models/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersServisce } from 'src/app/_services/members.service';  // Fixed typo in service import

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  
  public memberService=inject(MembersServisce);
 

  genderList=[{value:'male',display:'Males'},{value:'female',display:'Females'}]



  ngOnInit(): void {
    // Check if there are no members in the paginated result, then load members
    if (!this.memberService.paginatedResult()) {
      this.loadMembers();
    }
  }

  loadMembers(): void {
    // Fetch members from the service with the current pageNumber and pageSize
    this.memberService.getMembers();
  }

  resetFilters()
  {
    this.memberService.resetUserParams();
    this.loadMembers();
  }



  pageChanged(event: any): void {
    // Load members if the page number changes
    if (this.memberService.userParams().pageNumber !== event.page) {
      this.memberService.userParams().pageNumber = event.page;
      this.loadMembers();
    }
  }
}