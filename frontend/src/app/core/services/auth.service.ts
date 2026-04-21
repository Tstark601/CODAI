import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User, Token, LoginRequest, RegisterRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/api/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<Token> {
    return this.http.post<Token>(`${this.baseUrl}/login`, data).pipe(
      tap((tokens) => {
        this.saveTokens(tokens);
        this.loadCurrentUser().subscribe();
      })
    );
  }

  loadCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`).pipe(
      tap((user) => {
        localStorage.setItem('codai_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('codai_access_token');
    localStorage.removeItem('codai_refresh_token');
    localStorage.removeItem('codai_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('codai_access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('codai_refresh_token');
  }

  refreshTokens(): Observable<Token> {
    const refresh_token = this.getRefreshToken() || '';
    return this.http.post<Token>(`${this.baseUrl}/refresh`, { refresh_token }).pipe(
      tap((tokens) => this.saveTokens(tokens))
    );
  }

  private saveTokens(tokens: Token): void {
    localStorage.setItem('codai_access_token', tokens.access_token);
    localStorage.setItem('codai_refresh_token', tokens.refresh_token);
  }

  private getUserFromStorage(): User | null {
    const stored = localStorage.getItem('codai_user');
    return stored ? JSON.parse(stored) : null;
  }
}
