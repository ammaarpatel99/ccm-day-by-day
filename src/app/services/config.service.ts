import { Injectable } from '@angular/core';
import {Functions, httpsCallable} from "@angular/fire/functions";
import {APIEndpoints, ConfigReq, ConfigRes} from "../../../functions/src/api-types";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {map, shareReplay, tap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  readonly config$ = this.getConfig$()

  constructor(
    private readonly functions: Functions
  ) { }

  private getConfig$() {
    return fromPromise(
      httpsCallable<ConfigReq, ConfigRes>(this.functions, APIEndpoints.CONFIG)()
    ).pipe(
      map(({data}) => ({
        ...data,
        ramadanStartDate: new Date(data.ramadanStartDate),
        last10Days: new Date(data.last10Days)
      })),
      shareReplay(1)
    )
  }
}
