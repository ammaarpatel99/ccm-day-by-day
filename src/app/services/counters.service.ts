import { Injectable } from '@angular/core';
import {Observable, shareReplay, takeUntil} from "rxjs";
import {Counter} from "../../../functions/src/helpers";
import {collection, Firestore, onSnapshot} from "@angular/fire/firestore";
import {Functions} from "@angular/fire/functions";

@Injectable({
  providedIn: 'root'
})
export class CountersService {
  readonly counter = this.getCounter();

  constructor(
    private readonly functions: Functions,
    private readonly firestore: Firestore
  ) { }

  private getCounter() {
    return new Observable<Counter>(subscriber => {
      onSnapshot(collection(this.firestore, "counters"), snapshot => {
        const counters = snapshot.docs.map(doc => doc.data() as Counter)
        const res: Counter = {waseem: 0, target: 0, general: 0, manual: 0}
        for (const counter of counters) {
          res.general += counter.general || 0
          res.target += counter.target || 0
          res.waseem += counter.waseem || 0
          res.manual += counter.manual || 0
        }
        subscriber.next(res)
      })
    }).pipe(
      shareReplay(1)
    )
  }
}
