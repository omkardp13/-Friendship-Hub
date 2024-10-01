import { Component,computed,inject,Input } from '@angular/core';
import { Member } from 'src/app/_models/member';
import { LikesService } from 'src/app/_services/likes.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent {

  @Input() member!: Member;
  private likeService=inject(LikesService);

  private presenceService=inject(PresenceService);
  hasLiked=computed(() => this.likeService.likesIds().includes(this.member.id));

  isOnline=computed(() => this.presenceService.onlineUsers().includes(this.member.userName));



  toggleLike()
  {
    this.likeService.toggleLike(this.member.id).subscribe({
         next:() =>
         {
          if(this.hasLiked())
          {
            this.likeService.likesIds.update(ids => ids.filter(x=>x!==this.member.id))
          }
          else
          {
            this.likeService.likesIds.update(ids =>[...ids,this.member.id])
          }
         }
    })
  }

}
