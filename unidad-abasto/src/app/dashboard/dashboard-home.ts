import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DASHBOARD_OPTIONS } from './dashboard-menu';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
})
export class DashboardHomeComponent {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly denied =
    this.route.snapshot.queryParamMap.get('acceso') === 'denegado';

  readonly options = DASHBOARD_OPTIONS.filter((o) =>
    this.auth.hasModuleAccess(o.path, o.roles as string[]),
  );
}