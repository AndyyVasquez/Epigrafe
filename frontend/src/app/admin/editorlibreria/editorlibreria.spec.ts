import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorLibreria } from './editorlibreria.component';

describe('EditorLibreria', () => {
  let component: EditorLibreria;
  let fixture: ComponentFixture<EditorLibreria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorLibreria],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorLibreria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
