import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoBrickDialogComponent } from './no-brick-dialog.component';

describe('NoBrickDialogComponent', () => {
  let component: NoBrickDialogComponent;
  let fixture: ComponentFixture<NoBrickDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoBrickDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoBrickDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
