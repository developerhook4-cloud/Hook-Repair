import {
  Component,
  OnInit,
  inject,
  HostListener,
  ElementRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { IconService, FaIconDef } from '../../services/icon.service';
import { InputComponent } from '../../../../shared/components/input/input.component';

@Component({
  selector: 'app-icon-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './icon-search.component.html',
})
export class IconSearchComponent implements OnInit {
  private iconService = inject(IconService);
  private elementRef = inject(ElementRef);
  @Input() initialIcon = '';
  @Output() iconSelected = new EventEmitter<string>();

  allIcons: FaIconDef[] = [];
  filteredIcons: FaIconDef[] = [];
  searchControl = new FormControl('');

  selectedIcon: FaIconDef | null = null;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.filteredIcons = [];
    }
  }

  ngOnInit() {
    this.iconService.getIcons().subscribe((icons) => {
      this.allIcons = icons;
      this.filteredIcons = this.allIcons.slice(0, 40);
    });

    if (this.initialIcon) {
      const parts = this.initialIcon.split('fa-');
      if (parts.length > 1) {
        this.searchControl.setValue(parts[1], { emitEvent: false });
      }
    }

    this.searchControl.valueChanges.subscribe((term) => {
      this.filterIcons(term || '');
    });
  }

  filterIcons(term: string) {
    if (!term.trim()) {
      this.filteredIcons = this.allIcons.slice(0, 40);
      return;
    }

    const lowerTerm = term.toLowerCase();

    this.filteredIcons = this.allIcons.filter(
      (icon) =>
        icon.name.includes(lowerTerm) || icon.searchTerms.some((t) => t.includes(lowerTerm)),
    );
  }

  selectIcon(icon: FaIconDef) {
    this.selectedIcon = icon;
    this.searchControl.setValue(icon.name, { emitEvent: false });
    this.filteredIcons = [];

    const iconString = `${icon.style} fa-${icon.name}`;

    this.iconSelected.emit(iconString);
  }

  openDropdown() {
    if (this.filteredIcons.length === 0) {
      this.filterIcons(this.searchControl.value || '');
    }
  }
}
