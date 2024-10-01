import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { Member } from 'src/app/_models/member';
import { Photo } from 'src/app/_models/photo';
import { AccountService } from 'src/app/_services/account.service';
import { MembersServisce } from 'src/app/_services/members.service';  // Corrected service name
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent {
  @Input() member!: Member;
  @Output() memberChange = new EventEmitter<Member>();

  private accountService = inject(AccountService);
  public memberService = inject(MembersServisce);
  uploader?: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;

  ngOnInit(): void {
    this.initializeUploader();
  }

  fileOverBase(e: boolean): void {
    this.hasBaseDropZoneOver = e;
  }

  deletePhoto(photo: Photo): void {
    this.memberService.deletePhoto(photo).subscribe({
      next: () => {
        const updatedMember = { ...this.member };
        updatedMember.photos = updatedMember.photos.filter(x => x.id !== photo.id);
        this.memberChange.emit(updatedMember);
      },
      error: err => console.error('Failed to delete photo:', err)
    });
  }

  setMainPhoto(photo: Photo): void {
    this.memberService.setMainPhoto(photo).subscribe({
      next: () => {
        const user = this.accountService.currentUser();
        if (user) {
          user.photoUrl = photo.url;
          this.accountService.setCurrentUser(user);
        }

        const updatedMember = { ...this.member };
        updatedMember.photoUrl = photo.url;
        updatedMember.photos.forEach(p => {
          p.isMain = p.id === photo.id;
        });
        this.memberChange.emit(updatedMember);
      },
      error: err => console.error('Failed to set main photo:', err)
    });
  }

  initializeUploader(): void {
    this.uploader = new FileUploader({
      url: `${this.baseUrl}users/add-photo`,
      authToken: 'Bearer ' + this.accountService.currentUser()?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024, // 10 MB
    });

    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const photo: Photo = JSON.parse(response);
        const updatedMember = { ...this.member };
        updatedMember.photos.push(photo);
        this.memberChange.emit(updatedMember);
        if(photo.isMain)
        {
          const user = this.accountService.currentUser();
        if (user) {
          user.photoUrl = photo.url;
          this.accountService.setCurrentUser(user);
        }
        const updatedMember = { ...this.member };
        updatedMember.photoUrl = photo.url;
        updatedMember.photos.forEach(p => {
          p.isMain = p.id === photo.id;
        });
        this.memberChange.emit(updatedMember);
        }
      }
    };

    this.uploader.onErrorItem = (item, response, status, headers) => {
      console.error('Photo upload failed:', response);
    };
  }
}
