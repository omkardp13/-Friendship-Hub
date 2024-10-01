import { Component, OnInit, ViewChild, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HubConnectionState } from '@microsoft/signalr';
import { GalleryItem, ImageItem } from 'ng-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_models/message';
import { AccountService } from 'src/app/_services/account.service';
import { MembersServisce } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit,OnDestroy, AfterViewInit {
  ngOnDestroy(): void {
   this.messagesService.stopHubConnection();
  }

  @ViewChild('memberTabs',{static:true}) memberTabs?: TabsetComponent;

  private messagesService = inject(MessageService);
  private memberService = inject(MembersServisce);
  presenceService=inject(PresenceService);

  accountService=inject(AccountService);

  private route = inject(ActivatedRoute);
  router=inject(Router);

  member: Member={} as Member;
  images: GalleryItem[] = [];
 
  activeTab?: TabDirective;

  ngOnInit(): void {
    this.route.data.subscribe({
      next:data =>
      {
        this.member=data['member'];
        this.member && this.member.photos.map(p=>
        {
          this.images.push(new ImageItem({src:p.url,thumb:p.url}))
        }
        )
      }
    })

    this.route.paramMap.subscribe({
      next:_ => this.onRouteParamsChange()
    })

    this.route.queryParams.subscribe({
      next:params=>{
        params['tab'] && this.selectTab(params['tab'])
      }
    })
  }

  

  selectTab(heading:string)
  {
     if(this.memberTabs)
     {
       const messageTab=this.memberTabs.tabs.find(x=>x.heading === heading);
       if(messageTab) messageTab.active=true;
     }
  }
  ngAfterViewInit(): void {
    // Ensure ViewChild is available after the view initializes
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.selectTabBasedOnRoute();
    }
  }

  onRouteParamsChange()
  {
    const user=this.accountService.currentUser();
    if(!user) return;
    if(this.messagesService.hubConnection?.state === HubConnectionState.Connected && this.activeTab?.heading==='Messages')
    {
      this.messagesService.hubConnection.stop().then(()=>
      {
        this.messagesService.createHubConnection(user,this.member.userName);
      })
    }
  }


  onTabActivated(data: TabDirective): void {
    this.activeTab = data;
   
    this.router.navigate([],{
      relativeTo:this.route,
      queryParams:{tab:this.activeTab.heading},
      queryParamsHandling:'merge'
    })

    if (this.activeTab.heading === 'Messages' && this.member) {
        const user=this.accountService.currentUser();

        if(!user)
        {
           return;
        }
        this.messagesService.createHubConnection(user,this.member.userName);
    }
    else
    {
      this.messagesService.stopHubConnection();
    }
  }

 // loadMember(): void {
 //   const username = this.route.snapshot.paramMap.get('username');
 //   console.log('Username:', username); // Debugging log
 //   if (!username) {
 //     console.error("Username parameter not found in route");
  //    return;
  //  }

 //   this.memberService.getMember(username).subscribe({
  //    next: (member) => {
  //      this.member = member;
  //      this.loadMemberImages(member);
   //   },
    // error: (err) => console.error(`Failed to load member: ${err}`)
   // }/);
//  }

  loadMemberImages(member: Member): void {
    this.images = member.photos.map(p => new ImageItem({ src: p.url, thumb: p.url }));
  }

  selectTabBasedOnRoute(): void {
    // Logic to select the appropriate tab based on the route, if needed
    // Example: this.memberTabs?.tabs[1].active = true; // This is just a sample
  }
}
