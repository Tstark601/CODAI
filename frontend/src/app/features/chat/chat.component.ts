import {
  Component, inject, signal, ViewChild, ElementRef, AfterViewChecked, OnInit, HostListener
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { Message, Conversation } from '../../core/models';

interface UIMessage {
  role: 'user' | 'assistant';
  content: string;
  html?: SafeHtml;
  isLoading?: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, AfterViewChecked {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  @ViewChild('textareaEl') textareaEl!: ElementRef<HTMLTextAreaElement>;

  currentUser = this.authService.currentUser;
  conversations = signal<Conversation[]>([]);
  activeConversationId = signal<string | null>(null);
  messages = signal<UIMessage[]>([]);
  loading = signal(false);
  sidebarOpen = signal(true);
  private shouldScroll = false;

  form = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(1)]],
  });

  // Configure marked with highlight.js
  constructor() {
    const renderer = new marked.Renderer();
    
    renderer.code = (token: any) => {
      // In marked v15+, the code method receives a single token object
      let code = typeof token === 'string' ? token : token.text;
      const language = token.lang;
      
      const validLanguage = language && hljs.getLanguage(language as string) ? language : 'plaintext';
      const highlightedCode = hljs.highlight(code as string, { language: validLanguage as string }).value;
      const encodedCode = encodeURIComponent(code as string);

      return `
        <div class="code-wrapper" style="position: relative; margin: 16px 0; background: #0A0B10; border: 1px solid var(--bg-border); border-radius: var(--radius-md); overflow: hidden;">
          <div class="code-header flex justify-between items-center" style="padding: 8px 16px; background: rgba(0,0,0,0.4); border-bottom: 1px solid var(--bg-border);">
            <span class="text-xs text-muted font-mono" style="text-transform: uppercase;">${validLanguage}</span>
            <button class="copy-code-btn btn-icon" style="padding: 4px 8px; font-size: 0.75rem; gap: 4px;" data-code="${encodedCode}">
              <svg class="pointer-events-none" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span class="pointer-events-none">Copiar</span>
            </button>
          </div>
          <pre style="margin: 0; padding: 16px; border: none; overflow-x: auto; border-radius: 0; background: transparent;"><code class="hljs ${validLanguage}">${highlightedCode}</code></pre>
        </div>
      `;
    };

    marked.use({ renderer });
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }

  ngOnInit() {
    this.loadConversations();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (convs) => this.conversations.set(convs),
    });
  }

  selectConversation(conv: Conversation) {
    this.activeConversationId.set(conv.id);
    this.chatService.getConversation(conv.id).subscribe({
      next: (detail) => {
        const msgs: UIMessage[] = detail.messages.map((m) => ({
          role: m.role,
          content: m.content,
          html: m.role === 'assistant' ? this.renderMarkdown(m.content) : undefined,
        }));
        this.messages.set(msgs);
        this.shouldScroll = true;
      },
    });
  }

  newConversation() {
    this.activeConversationId.set(null);
    this.messages.set([]);
  }

  onSubmit() {
    const message = this.form.get('message')?.value?.trim();
    if (!message || this.loading()) return;

    // Add user message immediately
    const userMsg: UIMessage = { role: 'user', content: message };
    const loadingMsg: UIMessage = { role: 'assistant', content: '', isLoading: true };

    this.messages.update((msgs) => [...msgs, userMsg, loadingMsg]);
    this.form.reset();
    this.resetTextarea();
    this.loading.set(true);
    this.shouldScroll = true;

    this.chatService
      .sendMessage({ message, conversation_id: this.activeConversationId() || undefined })
      .subscribe({
        next: (response) => {
          this.activeConversationId.set(response.conversation_id);

          const assistantMsg: UIMessage = {
            role: 'assistant',
            content: response.message,
            html: this.renderMarkdown(response.message),
          };

          // Replace loading message with real response
          this.messages.update((msgs) => [...msgs.slice(0, -1), assistantMsg]);
          this.loading.set(false);
          this.shouldScroll = true;
          this.loadConversations();
        },
        error: () => {
          const errorMsg: UIMessage = {
            role: 'assistant',
            content: '⚠️ Hubo un error al contactar a David. Por favor intenta de nuevo.',
            html: '<p>⚠️ Hubo un error al contactar a David. Por favor intenta de nuevo.</p>',
          };
          this.messages.update((msgs) => [...msgs.slice(0, -1), errorMsg]);
          this.loading.set(false);
        },
      });
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }

  deleteConversation(id: string, event: Event) {
    event.stopPropagation();
    this.chatService.deleteConversation(id).subscribe({
      next: () => {
        this.conversations.update((c) => c.filter((conv) => conv.id !== id));
        if (this.activeConversationId() === id) {
          this.newConversation();
        }
      },
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  copyCode(content: string) {
    navigator.clipboard.writeText(content);
  }

  private renderMarkdown(content: string): SafeHtml {
    const html = marked.parse(content) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  @HostListener('click', ['$event'])
  onChatClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('copy-code-btn')) {
      const code = target.getAttribute('data-code');
      if (code) {
        navigator.clipboard.writeText(decodeURIComponent(code));
        const span = target.querySelector('span');
        if (span) {
          const original = span.innerText;
          span.innerText = '¡Copiado!';
          target.style.color = 'var(--color-success)';
          setTimeout(() => {
            span.innerText = original;
            target.style.color = '';
          }, 2000);
        }
      }
    }
  }

  private scrollToBottom() {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  private resetTextarea() {
    if (this.textareaEl) {
      this.textareaEl.nativeElement.style.height = 'auto';
    }
  }

  suggestions = [
    { icon: '🚀', text: 'Crear un proyecto fullstack desde cero', prompt: 'Quiero crear un proyecto fullstack completo con Angular y FastAPI. Ayúdame a definir la arquitectura y la estructura de carpetas.' },
    { icon: '🔍', text: 'Revisar y mejorar mi código', prompt: 'Quiero que revises un fragmento de código que tengo. Te lo comparto a continuación para que me digas cómo mejorarlo.' },
    { icon: '💡', text: 'Generar ideas de proyectos innovadores', prompt: 'Dame 5 ideas de proyectos tecnológicos innovadores que puedan tener impacto real en el mercado o en la sociedad.' },
    { icon: '🧠', text: 'Explicar un concepto de programación', prompt: 'Explícame de forma clara y con ejemplos de código el concepto de Clean Architecture y cómo aplicarlo en un proyecto real.' },
    { icon: '⚙️', text: 'Configurar CI/CD con GitHub Actions', prompt: 'Ayúdame a configurar un pipeline de CI/CD con GitHub Actions para un proyecto FastAPI + Angular que se despliega en Render.' },
    { icon: '🐛', text: 'Depurar un error difícil', prompt: 'Tengo un error que no logro resolver. Cuéntame el contexto y vemos juntos cómo solucionarlo paso a paso.' },
  ];

  useSuggestion(prompt: string) {
    this.form.patchValue({ message: prompt });
    this.onSubmit();
  }

  getInitials(): string {
    const user = this.currentUser;
    if (!user) return 'U';
    return (user.full_name || user.username).charAt(0).toUpperCase();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('es', { month: 'short', day: 'numeric' });
  }
}
