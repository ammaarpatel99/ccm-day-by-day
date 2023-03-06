import {Component, OnDestroy, OnInit} from '@angular/core';
import {AdminService} from "./services/admin.service";
import {AsyncSubject, takeUntil} from "rxjs";
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly destroyed = new AsyncSubject<true>()
  private readonly audio = new Audio("./assets/newDonorSound.mp3")
  sound = false
  decrementGeneral = false
  decrementBrick = false
  decrementWaseem = false
  decrementManual = false
  disableDecrement = false
  readonly manualOnBehalfOf = new FormControl("", [Validators.required, Validators.maxLength(25)])
  manualAnonymous = false
  disableManual = false
  manualResult: string | null = null


  get decrementIsDisabled() {
    return !(this.decrementGeneral || this.decrementBrick || this.decrementWaseem || this.decrementManual) || this.disableDecrement
  }

  downloadDigitalWall() {
    this.adminService.getDigitalWallData().subscribe()
  }

  onSoundChange() {
    if (this.sound) this.audio.play()
  }

  decrementCounters() {
    this.disableDecrement = true
    this.adminService.decrementCounter({
      waseem: this.decrementWaseem,
      target: this.decrementBrick,
      general: this.decrementGeneral,
      manual: this.decrementManual
    }).subscribe({
      next: () => {
        this.decrementGeneral = false;
        this.decrementWaseem = false;
        this.decrementBrick = false;
        this.decrementManual = false
      },
      complete: () => {
        this.disableDecrement = false
      }
    });
  }

  addManual() {
    this.disableManual = true
    this.adminService.addManual({
      onBehalfOf: this.manualOnBehalfOf.value as string,
      anonymous: this.manualAnonymous
    }).subscribe({
      next: res => {
        this.manualOnBehalfOf.setValue("")
        this.manualOnBehalfOf.updateValueAndValidity()
        this.manualAnonymous = false
        this.manualResult = `${res.data.generalID}-${res.data.brickID}-${res.data.manualID}`
      },
      complete: () => {
        this.disableManual = false
      }
    });
  }

  readonly counter = this.adminService.counter;

  constructor(
    private readonly adminService: AdminService
  ) { }

  private watchCounter() {
    this.adminService.counter.pipe(
      takeUntil(this.destroyed)
    ).subscribe((res) => {
      if (this.sound) this.audio.play()
    })
  }

  ngOnInit(): void {
    this.watchCounter()
  }

  ngOnDestroy(): void {
    this.destroyed.next(true)
    this.destroyed.complete()
  }

}
