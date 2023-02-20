import {Component, OnInit} from '@angular/core';
import {SubscriptionService} from "./subscription.service";
import {Functions, httpsCallable} from "@angular/fire/functions";

interface StripeSubData {
  sessionID: string;
  docID: string;
}

enum SubscriptionState {
  NOT_FOUND,
  IN_PROGRESS,
  COMPLETE,
  ERROR
}

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  state: SubscriptionState = SubscriptionState.IN_PROGRESS
  subscriptionState = SubscriptionState

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly functions: Functions
  ) { }

  ngOnInit(): void {
    if (!this.subscriptionService.sessionID || !this.subscriptionService.docID) {
      this.state = SubscriptionState.NOT_FOUND
      return
    }
    httpsCallable<StripeSubData, any>(this.functions, `stripeSub`)({
      sessionID: this.subscriptionService.sessionID,
      docID: this.subscriptionService.docID
    }).then(() => this.state = SubscriptionState.COMPLETE)
      .catch(() => this.state = SubscriptionState.ERROR)
  }

  goToWebsiteSuccessPage() {
    window.location.href = 'https://cambridgecentralmosque.org' // TODO: change this link
  }

}
