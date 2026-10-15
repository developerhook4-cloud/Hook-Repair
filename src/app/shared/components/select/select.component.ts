import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  host: { class: 'block w-full' },
  template: `
    <div class="relative w-full">      
      <button type="button" (click)="toggle()" 
        class="w-full flex items-center justify-between px-4 py-2.5 rounded-[14px] focus:outline-none transition-all"
        [ngClass]="{
          'bg-brand-primary text-white label-normal hover:opacity-90 shadow-sm border border-transparent': variant === 'solid',
          'bg-white text-dark-1 body-normal border border-gray-300 hover:border-gray-400 focus:border-brand-primary': variant === 'outline'
        }">
        
        <span class="truncate">{{ value }}</span>
        <fa-icon [icon]="faChevronDown" class="text-sm ml-2 transition-transform duration-200" [ngClass]="{'rotate-180': isOpen}"></fa-icon>
      
      </button>

      <div *ngIf="isOpen" class="absolute top-full right-0 mt-2 w-full bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100 z-50 p-1.5 max-h-60 overflow-y-auto">
        <ul class="flex flex-col text-sm font-semibold">
          <li *ngFor="let opt of options" (click)="select(opt)" 
              class="px-4 py-2.5 rounded-md cursor-pointer transition-colors" 
              [ngClass]="opt === value ? 'text-brand-primary bg-red-50/50' : 'text-dark-2 hover:bg-red-50 hover:text-brand-primary'">
            {{ opt }}
          </li>
        </ul>
      </div>
    </div>
  `
})

export class SelectComponent {
  @Input() options: string[] = [];
  @Input() value: string = '';
  @Input() variant: 'solid' | 'outline' = 'outline';
  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  faChevronDown = faChevronDown;

  constructor(private eRef: ElementRef) {}

  toggle() {
    this.isOpen = !this.isOpen;
  }

  select(opt: string) {
    this.value = opt;
    this.valueChange.emit(this.value);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}