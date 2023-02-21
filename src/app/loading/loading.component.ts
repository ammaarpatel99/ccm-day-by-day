import {Component, OnInit} from '@angular/core';
import {ConfigService} from "../services/config.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.configService.config$.subscribe(() => {
      this.router.navigate(['/', 'setup']);
    });
  }
}
