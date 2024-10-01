import { NgFor } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Member } from 'src/app/_models/member';
import { AccountService } from 'src/app/_services/account.service';
import { MembersServisce } from 'src/app/_services/members.service'; // Corrected service name

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm?: NgForm;

  @HostListener('window:beforeunload', ['$event'])
  notifyBeforeUnload($event: any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }

  member?: Member;

  constructor(
    private accountService: AccountService,
    private memberService: MembersServisce, // Corrected service name
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember(): void {
    const user = this.accountService.currentUser();
    if (!user) return;

    this.memberService.getMember(user.username).subscribe({
      next: (member) => (this.member = member),
     
    });
  }

  updateMember(): void {
    if (!this.editForm?.valid) return;

    this.memberService.updateMember(this.editForm.value).subscribe({
      next: () => {
        this.toastr.success('Profile updated successfully');
        this.editForm?.reset(this.member); // Reset the form after successful update
      },
    
    });
  }

  onMemberChange($event: Member): void {
    this.member = $event; // Update member data when it changes
  }
}
