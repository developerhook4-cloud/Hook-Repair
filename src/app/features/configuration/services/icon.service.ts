import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface FaIconDef {
  name: string;
  style: string;
  searchTerms: string[];
}

@Injectable({
  providedIn: 'root',
})
export class IconService {
  private http = inject(HttpClient);

  getIcons(): Observable<FaIconDef[]> {
    return this.http.get<any>('/data/icon-families.json').pipe(
      map((data) => {
        const iconsArray: FaIconDef[] = [];

        for (const [iconName, iconData] of Object.entries(data)) {
          const info = iconData as any;
          const freeStyles = info.familyStylesByLicense?.free;
          if (!freeStyles || freeStyles.length === 0) continue;
          const availableStyles = freeStyles.map((s: any) => s.style);

          let stylePrefix = 'fas';
          if (availableStyles.includes('brands')) {
            stylePrefix = 'fab';
          } else if (availableStyles.includes('regular') && !availableStyles.includes('solid')) {
            stylePrefix = 'far';
          }

          iconsArray.push({
            name: iconName,
            style: stylePrefix,
            searchTerms: info.search?.terms || [],
          });
        }

        return iconsArray;
      }),
    );
  }
}
