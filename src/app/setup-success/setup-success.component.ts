import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SubscriptionService} from "../subscription/subscription.service";

@Component({
  selector: 'app-setup-success',
  templateUrl: './setup-success.component.html',
  styleUrls: ['./setup-success.component.scss']
})
export class SetupSuccessComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly subscriptionService: SubscriptionService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.subscriptionService.sessionID = params.get('session_id')
      this.subscriptionService.docID = params.get('doc_id')
      this.router.navigate(['/', 'subscription'])
    })
  }

}
