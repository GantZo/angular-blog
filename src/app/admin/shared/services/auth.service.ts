import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {FbAuthResponse, User} from "../../../shared/interfaces";
import {Observable, Subject, throwError} from "rxjs";
import {environment} from "../../../../environments/environment";
import {catchError, map, tap} from "rxjs/operators";

@Injectable()
export class AuthService {

  public error$: Subject<string> = new Subject<string>()

  constructor(private http: HttpClient) {
  }

  get token(): string | null {
    const expDate = new Date(localStorage.getItem('fb-token-exp')!)
    if (new Date() > expDate) {
      this.logout()
      return null
    }
    return localStorage.getItem('fb-token')!
  }

  login(user: User): Observable<any> {
    user.returnSecureToken = true
    return  this.http.post<FbAuthResponse>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
      .pipe(
        catchError(this.handleError.bind(this)),
        tap(this.setToken)
      )
  }

  logout() {
    this.setToken(null)
  }

  private handleError(error: HttpErrorResponse) {
    const {message} = error.error.error
    switch (message) {
      case 'EMAIL_NOT_FOUND':
        this.error$.next('email не существует')
        break
      case 'INVALID_PASSWORD':
        this.error$.next('Неверный пароль')
        break
      case 'INVALID_EMAIL':
        this.error$.next('Неверный email')
        break
    }
    return throwError(error)
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  private setToken(response: FbAuthResponse | null) {
    if (response) {
      const expireDate = new Date(new Date().getTime() + +response.expiresIn * 1000)
      localStorage.setItem('fb-token', response.idToken)
      localStorage.setItem('fb-token-exp', expireDate.toString())
    } else {
      localStorage.clear()
    }
  }
}
