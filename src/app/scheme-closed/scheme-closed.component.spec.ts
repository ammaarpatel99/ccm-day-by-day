import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeClosedComponent } from './scheme-closed.component';

describe('SchemeClosedComponent', () => {
  let component: SchemeClosedComponent;
  let fixture: ComponentFixture<SchemeClosedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SchemeClosedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemeClosedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
