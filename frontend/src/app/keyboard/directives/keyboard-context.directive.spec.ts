import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyboardContextDirective } from './keyboard-context.directive';
import { KeyboardNavigationService } from '../services/keyboard-navigation.service';

@Component({
  standalone: true,
  imports: [KeyboardContextDirective],
  template: `<div appKeyboardContext="reports" ariaLabel="Reports Section"></div>`,
})
class TestHostComponent {}

describe('KeyboardContextDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let navService: KeyboardNavigationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    navService = TestBed.inject(KeyboardNavigationService);
    fixture.detectChanges();
  });

  afterEach(() => {
    navService.ngOnDestroy();
  });

  it('should create host component with directive', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should set data-keyboard-context attribute', () => {
    const div = fixture.nativeElement.querySelector('[data-keyboard-context]');
    expect(div).toBeTruthy();
    expect(div.getAttribute('data-keyboard-context')).toBe('reports');
  });

  it('should set role="region"', () => {
    const div = fixture.nativeElement.querySelector('[data-keyboard-context]');
    expect(div.getAttribute('role')).toBe('region');
  });

  it('should activate context on focusin', () => {
    const div = fixture.nativeElement.querySelector('[data-keyboard-context]');
    div.dispatchEvent(new FocusEvent('focusin'));
    expect(navService.activeContext()).toBe('reports');
  });

  it('should deactivate context on focusout', () => {
    const div = fixture.nativeElement.querySelector('[data-keyboard-context]');
    div.dispatchEvent(new FocusEvent('focusin'));
    expect(navService.activeContext()).toBe('reports');
    div.dispatchEvent(new FocusEvent('focusout'));
    expect(navService.activeContext()).toBeNull();
  });

  it('should activate context on mouseenter', () => {
    const div = fixture.nativeElement.querySelector('[data-keyboard-context]');
    div.dispatchEvent(new MouseEvent('mouseenter'));
    expect(navService.activeContext()).toBe('reports');
  });

  it('should deactivate context on mouseleave', () => {
    const div = fixture.nativeElement.querySelector('[data-keyboard-context]');
    div.dispatchEvent(new MouseEvent('mouseenter'));
    expect(navService.activeContext()).toBe('reports');
    div.dispatchEvent(new MouseEvent('mouseleave'));
    expect(navService.activeContext()).toBeNull();
  });
});
