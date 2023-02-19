import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  sessionID: string | null = null;
  docID: string | null = null;

  constructor() { }
}
