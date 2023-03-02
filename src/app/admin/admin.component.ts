import { Component } from '@angular/core';
import {AdminService} from "./services/admin.service";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  downloadDigitalWall() {
    this.adminService.getDigitalWallData().subscribe()
  }

  constructor(
    private readonly adminService: AdminService
  ) { }

}
