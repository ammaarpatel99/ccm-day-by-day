import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {map, switchMap} from "rxjs";
import {Functions, httpsCallable} from "@angular/fire/functions";

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss']
})
export class SuccessComponent implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly functions: Functions
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('session_id')),
      switchMap(sessionID =>
        httpsCallable<any, any>(this.functions, `stripeSub`)({
          sessionID: sessionID,
          price: 4567
        })
      )
    ).subscribe(res => console.log(res))
  }
}
