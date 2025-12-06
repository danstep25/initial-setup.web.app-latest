import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SideNavBarService {
  private readonly activeModule$ = new BehaviorSubject<string>(null);
  readonly _activeModule$ = this.activeModule$.asObservable();
  private readonly activeSubModule$ = new BehaviorSubject<string>(null);
  readonly _activeSubModule$ = this.activeSubModule$.asObservable();

  isActiveModule(module: string) {
    this.activeModule$.next(module);
  }

  isActiveSubModule(subModule: string) {
    this.activeSubModule$.next(subModule);
  }
}
