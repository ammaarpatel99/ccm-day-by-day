import {Component, OnDestroy, OnInit} from '@angular/core';
import {AdminService} from "./services/admin.service";
import {AsyncSubject, takeUntil} from "rxjs";

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
  disableDecrement = false

  get decrementIsDisabled() {
    return !(this.decrementGeneral || this.decrementBrick || this.decrementWaseem) || this.disableDecrement
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
      general: this.decrementGeneral
    }).subscribe({
      next: () => {
        this.decrementGeneral = false;
        this.decrementWaseem = false;
        this.decrementBrick = false;
      },
      complete: () => {
        this.disableDecrement = false
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
