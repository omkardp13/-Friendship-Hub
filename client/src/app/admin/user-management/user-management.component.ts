import { Component, inject, OnInit } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { User } from 'src/app/_models/User';
import { AdminService } from 'src/app/_services/admin.service';
import { RolesModalComponent } from 'src/app/modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  private modalService = inject(BsModalService);
  private adminService = inject(AdminService);

  users: User[] = [];
  bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>();

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  openRolesModal(user: User) {
    const initialState: ModalOptions = {
      class: 'modal-lg',
      initialState: {
        title: 'User roles',
        username: user.username,
        selectedRoles: [...user.roles],
        availableRoles: ['Admin', 'Moderator', 'Member'],
        rolesUpdated: false
      }
    };

    this.bsModalRef = this.modalService.show(RolesModalComponent, initialState);

    // Subscribe to the modal close event and update roles if needed
    this.bsModalRef.onHide?.subscribe(() => {
      if (this.bsModalRef.content?.rolesUpdated) {
        const selectedRoles = this.bsModalRef.content.selectedRoles;
        this.adminService.updateUserRole(user.username, selectedRoles).subscribe({
          next: roles => {
            // Update the user's roles locally
            user.roles = roles;
          }
        });
      }
    });
  }

  getUsersWithRoles() {
    this.adminService.getUserWithRole().subscribe({
      next: (users) => {
        this.users = users;
      }
    });
  }
}
