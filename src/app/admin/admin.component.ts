import {Component, OnDestroy, OnInit} from '@angular/core';
import {AdminService} from "./services/admin.service";
import {AsyncSubject, takeUntil} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private readonly destroyed = new AsyncSubject<true>()
  private readonly audio = new Audio("./assets/newDonorSound.mp3")
  sound = false
  readonly decrementForm = new FormGroup({
    general: new FormControl(false),
    brick: new FormControl(false),
    waseem: new FormControl(false),
    manual: new FormControl(false),
    generalPledge: new FormControl(0),
    brickPledge: new FormControl(0),
    waseemPledge: new FormControl(0),
    manualPledge: new FormControl(0),
    iftarPledge: new FormControl(0),
  });
  disableDecrement = false
  readonly manualForm = new FormGroup({
    onBehalfOf: new FormControl("", [Validators.required, Validators.maxLength(25)]),
    anonymous: new FormControl(false),
    amount: new FormControl(900, [Validators.min(900)])
  });
  disableManual = false
  manualResult: string | null = null
  uploadingImage = false;
  imageUploadTxt = "";


  get decrementIsDisabled() {
    return !(
      this.decrementForm.controls.general ||
      this.decrementForm.controls.brick ||
      this.decrementForm.controls.waseem ||
      this.decrementForm.controls.manual ||
      this.decrementForm.controls.generalPledge ||
      this.decrementForm.controls.brickPledge ||
      this.decrementForm.controls.waseemPledge ||
      this.decrementForm.controls.manualPledge ||
      this.decrementForm.controls.iftarPledge
    ) || this.disableDecrement
  }

  get manualIsDisabled() {
    return this.manualForm.invalid || this.disableManual
  }

  downloadDigitalWall() {
    this.adminService.getDigitalWallData().subscribe()
  }

  onSoundChange() {
    // if (this.sound) this.audio.play()
  }

  decrementCounters() {
    this.disableDecrement = true
    this.adminService.decrementCounter({
      waseem: this.decrementForm.controls.waseem.value ? -1 : undefined,
      target: this.decrementForm.controls.brick.value ? -1 : undefined,
      general: this.decrementForm.controls.general.value ? -1 : undefined,
      manual: this.decrementForm.controls.manual.value ? -1 : undefined,
      iftarPledges: this.decrementForm.controls.iftarPledge.value || undefined,
      pledges: this.decrementForm.controls.generalPledge.value || undefined,
      waseemPledges: this.decrementForm.controls.waseemPledge.value || undefined,
      targetPledges: this.decrementForm.controls.brickPledge.value || undefined,
      manualPledges: this.decrementForm.controls.manualPledge.value || undefined,
    }).subscribe({
      next: () => {
        this.decrementForm.reset({
          waseem: false, waseemPledge: 0, manualPledge: 0, brickPledge: 0,
          generalPledge: 0, iftarPledge: 0, manual: false, brick: false, general: false,
        })
      },
      complete: () => {
        this.disableDecrement = false
      }
    });
  }

  addManual() {
    this.disableManual = true
    this.adminService.addManual({
      onBehalfOf: this.manualForm.controls.onBehalfOf.value || "",
      amount: this.manualForm.controls.amount.value || 900,
      anonymous: this.manualForm.controls.anonymous.value || false,
    }).subscribe({
      next: res => {
        this.manualForm.reset({
          onBehalfOf: "", anonymous: false, amount: 900,
        });
        this.manualResult = `${res.data.generalID}-${res.data.brickID}-${res.data.manualID}`
      },
      complete: () => {
        this.disableManual = false
      }
    });
  }

  async uploadFile(event: any) {
    this.uploadingImage = true
    const files = event?.target?.files
    if (!files || !(files instanceof FileList)) {
      throw new Error(`Incorrect event$ passed after file upload.`);
    }
    const digitalWall = files[0]
    if (!digitalWall) {
      this.imageUploadTxt = ""
      return
    }
    this.imageUploadTxt = `Uploading "${digitalWall.name}"`;
    const reader = new FileReader()
    reader.readAsDataURL(digitalWall)
    const dataURL = await new Promise<string>(resolve => {
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
    })
    this.adminService.uploadFile({
      filename: digitalWall.name, imageDataURL: dataURL
    }).subscribe({
      next: url => this.imageUploadTxt = `Image available at: "${url}"`,
      complete: () => this.uploadingImage = false
    });
  }

  readonly counter = this.adminService.counter;

  constructor(
    private readonly adminService: AdminService
  ) { }

  private watchCounter() {
    this.adminService.counter.pipe(
      takeUntil(this.destroyed)
    ).subscribe(() => {
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
