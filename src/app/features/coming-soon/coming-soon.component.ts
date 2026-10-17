import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHourglassHalf } from '@fortawesome/free-solid-svg-icons';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [RouterLink, FontAwesomeModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="min-h-screen bg-light-4 p-4 md:p-6 pt-20 md:pt-24 flex">
      <main class="flex-1 flex items-center justify-center">
        <section class="bg-white rounded-2xl shadow-card p-10 max-w-lg w-full text-center">
          <fa-icon [icon]="faHourglassHalf" class="text-5xl text-brand-primary"></fa-icon>
          <h1 class="mt-4 text-2xl font-bold text-dark-1">{{ title }}</h1>
          <span
            class="inline-block mt-3 bg-info-subtle text-info-darker text-xs font-semibold px-3 py-1 rounded-full"
          >
            Próximamente
          </span>
          <p class="mt-4 text-dark-3">
            Estamos trabajando en esta sección. Pronto estará disponible.
          </p>
          <a
            routerLink="/inventory"
            class="inline-block mt-6 px-5 py-2 rounded-xl bg-brand-primary text-light-4 font-semibold hover:opacity-90"
          >
            Ir a Inventario
          </a>
        </section>
      </main>
    </div>
  `,
})
export class ComingSoonComponent {
  faHourglassHalf = faHourglassHalf;
  title: string = inject(ActivatedRoute).snapshot.data['title'] ?? 'Esta sección';
}
