import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LikesService } from '../_services/likes.service';
import { Member } from '../_models/member';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit, OnDestroy {

  likesService = inject(LikesService);

  predicate = 'liked';
  pageNumber = 1;
  pageSize = 5;

  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.loadLikes();
  }

  getTitle() {
    switch (this.predicate) {
      case 'liked': return "Members you like";
      case 'likedBy': return "Members who like you";
      default: return 'Mutual';
    }
  }

  loadLikes() {
   
      this.likesService.getLikes(this.predicate, this.pageNumber, this.pageSize);

  }

  pageChanged(event: any) {
    if (this.pageNumber !== event.page) {
      this.pageNumber = event.page;
      this.loadLikes();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
    this.likesService.paginatedResult.set(null);
  }
}
