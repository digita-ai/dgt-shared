import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { DGTUser } from '../models/dgt-user.model';

export abstract class DGTAuthService {

  constructor() {

  }

  public abstract signIn(email: string, password: string): Observable<DGTUser>;
  public abstract signInWitEmailLink(email: string, link: string): Observable<DGTUser>;
  public abstract sendEmailLink(email: string, returnUrl: string): Observable<void>;
  public abstract isSignInEmailLink(link: string): boolean;
  public abstract sendPasswordResetEmail(email: string): Observable<any>;
  public abstract confirmPasswordReset(requestId: string, newPassword: string): Observable<any>;
  public abstract updateInfo(profile: { displayName: string, photoURL: string }, email: string): Observable<any>;
  public abstract updatePassword(password: string): Observable<any>;
  public abstract deleteAccount(): Observable<any>;
  public abstract signOut(): Observable<any>;
  public abstract createUser(email: string, password: string): Observable<any>;
  public abstract checkIfEmailExists(email: string): Observable<boolean>;
  public abstract verifyEmail(actionCode: string): Observable<void>;
  public abstract getEmailFromActionCode(actionCode: string): Observable<string>;
}
