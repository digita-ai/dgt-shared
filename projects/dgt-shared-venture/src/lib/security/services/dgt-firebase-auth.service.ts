
import { from as observableFrom, Observable, forkJoin, combineLatest } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from 'firebase';
import * as _ from 'lodash';
import { SetUser, SetProfile } from '../../state/models/dgt-actions.model';
import { DGTProfile } from '../../domain/models/dgt-profile.model';
import { DGTLoggerService } from '@digita/dgt-shared-utils';
import { DGTBaseRootState, DGTAuthService, DGTStoreService } from '@digita/dgt-shared-web';
import { LoadEntity } from '@digita/dgt-shared-web';
import { DGTFirebaseBaseAppState } from '../../state/models/dgt-firebase-base-app-state.model';

@Injectable()
export class DGTFirebaseAuthService<T extends DGTBaseRootState<DGTFirebaseBaseAppState>> extends DGTAuthService {

  protected user: User;
  protected profile: DGTProfile;
  protected profiles: Array<DGTProfile>;
  public redirectResult: Observable<any>;

  constructor(private authIntance: AngularFireAuth, private logger: DGTLoggerService, private store: DGTStoreService<T>) {
    super();

    this.redirectResult = observableFrom(this.authIntance.auth.getRedirectResult());

    this.redirectResult.pipe(
      tap(data => {
        this.logger.debug(DGTAuthService.name, 'Redirect result', data);
      }),
      catchError(err => {
        this.logger.error(DGTAuthService.name, 'Redirect result failed', err);

        return null;
      }),
    );

    combineLatest(
      this.authIntance.authState,
      this.store.select(state => state.app.profileList),
      (user, profiles) => ({ user, profiles })
    )
      .subscribe(slice => {
        let changed = false;

        if (this.user !== slice.user) {
          this.logger.debug(DGTAuthService.name, 'Current user changed', slice.user);
          this.user = slice.user;
          changed = true;

          this.store.dispatch(new SetUser(slice.user));

          if (slice.user) {
            this.store.dispatch(new LoadEntity({ entityType: 'profile', entityId: slice.user.uid }));
          }
        }

        if (slice.profiles && slice.profiles !== this.profiles) {
          this.logger.debug(DGTAuthService.name, 'Profiles changed', slice.profiles);
          this.profiles = slice.profiles;
          changed = true;
        }

        if (changed && this.profiles && this.user) {
          const foundProfile = this.profiles.find(profile => profile.id === this.user.uid);

          if (foundProfile && foundProfile !== this.profile) {
            this.profile = foundProfile;
            this.store.dispatch(new SetProfile(this.profile));
          }
        }
      });
  }

  public signIn(email: string, password: string): Observable<User> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Signing-in user.');

    return observableFrom(this.authIntance.auth.signInWithEmailAndPassword(email, password)).pipe(
      map((userCredentials: firebase.auth.UserCredential) => userCredentials.user));
  }

  public signInWitEmailLink(email: string, link: string): Observable<{ user: User, isNew: boolean }> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Signing-in user with email link.');

    return observableFrom(this.authIntance.auth.signInWithEmailLink(email, link)).pipe(
      map((userCredentials: firebase.auth.UserCredential) =>
        ({ user: userCredentials.user, isNew: userCredentials.additionalUserInfo.isNewUser })));
  }

  public sendEmailLink(email: string, returnUrl: string): Observable<void> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Sending login link email.');

    const actionCodeSettings = {
      // URL you want to redirect back to. The domain (www.example.com) for this
      // URL must be whitelisted in the Firebase Console.
      url: returnUrl,
      // This must be true.
      handleCodeInApp: true
    };

    return observableFrom(this.authIntance.auth.sendSignInLinkToEmail(email, actionCodeSettings));
  }

  public isSignInEmailLink(link: string): boolean {
    this.logger.debug(DGTFirebaseAuthService.name, 'Check if login link email.');

    return this.authIntance.auth.isSignInWithEmailLink(link);
  }

  public sendPasswordResetEmail(email: string): Observable<any> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Sending reset password email.');

    return observableFrom(this.authIntance.auth.sendPasswordResetEmail(email));
  }

  public confirmPasswordReset(requestId: string, newPassword: string): Observable<any> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Confirming password reset.');

    return observableFrom(this.authIntance.auth.confirmPasswordReset(requestId, newPassword));
  }

  public updateInfo(profile: { displayName: string, photoURL: string }, email: string): Observable<any> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Update user info.');

    const observableProfile: Observable<any> = observableFrom(this.authIntance.auth.currentUser.updateProfile(profile));
    const observableEmail: Observable<any> = observableFrom(this.authIntance.auth.currentUser.updateEmail(email));

    return forkJoin(observableEmail, observableProfile);
  }

  public updatePassword(password: string): Observable<any> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Update user password.');

    return observableFrom(this.authIntance.auth.currentUser.updatePassword(password));
  }

  public deleteAccount(): Observable<any> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Deleting user.');

    return observableFrom(this.authIntance.auth.currentUser.delete());
  }

  public signOut(): Observable<any> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Signing-out user');

    return observableFrom(this.authIntance.auth.signOut());
  }

  public createUser(email: string, password: string): Observable<any> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Creating user.');

    return observableFrom(this.authIntance.auth.createUserWithEmailAndPassword(email, password));
  }

  public checkIfEmailExists(email: string): Observable<boolean> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Checking if user exists', email);

    return observableFrom(this.authIntance.auth.fetchProvidersForEmail(email)).pipe(
      map(providers => (providers && providers.length > 0)));
  }

  public verifyEmail(actionCode: string): Observable<void> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Verifying email address', actionCode);

    return observableFrom(this.authIntance.auth.applyActionCode(actionCode));
  }

  public getEmailFromActionCode(actionCode: string): Observable<string> {
    this.logger.debug(DGTFirebaseAuthService.name, 'Verifying email address', actionCode);

    return observableFrom(this.authIntance.auth.checkActionCode(actionCode)).pipe(
      map(data => data.data.email));
  }
}
