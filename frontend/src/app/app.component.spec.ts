import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideTransloco } from '@jsverse/transloco';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTransloco({
          config: {
            availableLangs: ['en', 'hi'],
            defaultLang: 'en',
            reRenderOnLangChange: true,
            prodMode: true,
          }
        })
      ]
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have OneBook as title signal', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title()).toEqual('OneBook');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    httpTesting.expectOne('/api/health');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('OneBook');
  });

  it('should compute status message', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.backendStatus.set('UP');
    expect(app.statusMessage()).toContain('OneBook');
    expect(app.statusMessage()).toContain('UP');
  });

  it('should initialize component status signals', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.postgresqlStatus()).toEqual('Checking...');
    expect(app.redisStatus()).toEqual('Checking...');
  });

  it('should update signals on successful health response', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/health');
    req.flush({
      status: 'UP',
      service: 'OneBook API',
      thread: 'VirtualThread[#1]/runnable@ForkJoinPool',
      components: { postgresql: 'UP', redis: 'UP' }
    });

    expect(app.backendStatus()).toEqual('UP');
    expect(app.postgresqlStatus()).toEqual('UP');
    expect(app.redisStatus()).toEqual('UP');
    expect(app.threadInfo()).toContain('VirtualThread');
  });

  it('should set Unavailable on error response', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/health');
    req.error(new ProgressEvent('error'));

    expect(app.backendStatus()).toEqual('Unavailable');
    expect(app.postgresqlStatus()).toEqual('Unavailable');
    expect(app.redisStatus()).toEqual('Unavailable');
  });
});
