import {Component, OnInit} from '@angular/core';
import {ConfigService} from "../services/config.service";
import {Router} from "@angular/router";
import {DonationApplicationService} from "../services/donation-application.service";

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  constructor(
    private readonly donationApplicationService: DonationApplicationService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.donationApplicationService.setupWithConfig().subscribe(() => {
      this.router.navigate(['/', 'setup']);
    });
  }
}
