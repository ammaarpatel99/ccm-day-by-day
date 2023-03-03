import {Component, OnInit} from '@angular/core';
import {ConfigService} from "../services/config.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DonationApplicationService} from "../services/donation-application.service";
import {PromoCode} from "../../../functions/src/api-types";
import {first, forkJoin, map} from "rxjs";

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly donationApplicationService: DonationApplicationService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    const promoCode$ = this.route.paramMap.pipe(
      first(),
      map(params => {
        const promoCode = params.get('promoCode')
        const promoCodes: PromoCode[] = [PromoCode.WASEEM]
        if (promoCode && (promoCodes as string[]).includes(promoCode)) {
          this.donationApplicationService.promoCode = promoCode as PromoCode
        }
      })
    )
    const setup$ = this.donationApplicationService.setup().pipe(
      first()
    );
    forkJoin([promoCode$, setup$]).subscribe(() => {
      this.router.navigate(['/', 'setup']);
    })
  }
}
