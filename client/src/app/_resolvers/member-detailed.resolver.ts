import { ResolveFn } from '@angular/router';
import { Member } from '../_models/member';
import { inject } from '@angular/core';
import { MembersServisce } from '../_services/members.service';

export const memberDetailedResolver: ResolveFn<Member | null > = (route, state) => {

  const memberService =inject(MembersServisce);

  const username=route.paramMap.get('username');

  if(!username) return null;

  return memberService.getMember(username);
};
