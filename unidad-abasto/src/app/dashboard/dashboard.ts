import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  username: string = '';
  roles: string[] = [];

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.authService.getCurrentUser();
    this.username = user?.username || '';
    this.roles = this.authService.getRoles();
    
    console.log('Dashboard - Usuario:', this.username, 'Roles:', this.roles);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}