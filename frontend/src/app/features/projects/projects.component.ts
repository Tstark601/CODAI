import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="projects-page fade-in">
      <header class="page-header">
        <div class="page-header-inner">
          <div class="brand">
            <span class="brand-name">CODAI</span>
          </div>
          <a routerLink="/chat" class="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Volver al chat
          </a>
        </div>
      </header>
      <div class="page-content">
        <div class="coming-soon">
          <div class="coming-icon">🚀</div>
          <h1>Mis Proyectos</h1>
          <p>Aquí aparecerán todos los proyectos que crees con David.<br/>Este módulo estará completo muy pronto.</p>
          <a routerLink="/chat" class="btn btn-primary" id="back-to-chat">Empezar a crear con David</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .projects-page { height: 100vh; display: flex; flex-direction: column; }
    .page-header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--bg-border);
      padding: var(--space-4) var(--space-6);
    }
    .page-header-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
    .brand-name {
      font-size: 1.25rem; font-weight: 800;
      background: linear-gradient(135deg, var(--color-primary-light), var(--color-accent));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .page-content { flex: 1; display: flex; align-items: center; justify-content: center; }
    .coming-soon { text-align: center; padding: var(--space-8); }
    .coming-icon { font-size: 4rem; margin-bottom: var(--space-6); }
    h1 { font-size: 2rem; margin-bottom: var(--space-4); }
    p { color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-8); }
  `],
})
export class ProjectsComponent {}
