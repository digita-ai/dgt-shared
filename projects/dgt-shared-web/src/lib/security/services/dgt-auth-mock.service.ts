import { DGTAuthService } from './dgt-auth.service';
import { Observable } from 'rxjs';
import { DGTUser } from '../models/dgt-user.model';
import { DGTInjectable } from '@digita/dgt-shared-utils';


@DGTInjectable()
export class DGTAuthMockService extends DGTAuthService {
    public signIn(email: string, password: string): Observable<DGTUser> {
        throw new Error('Method not implemented.');
    }    public signInWitEmailLink(email: string, link: string): Observable<DGTUser> {
        throw new Error('Method not implemented.');
    }
    public sendEmailLink(email: string, returnUrl: string): Observable<void> {
        throw new Error('Method not implemented.');
    }
    public isSignInEmailLink(link: string): boolean {
        throw new Error('Method not implemented.');
    }
    public sendPasswordResetEmail(email: string): Observable<any> {
        throw new Error('Method not implemented.');
    }
    public confirmPasswordReset(requestId: string, newPassword: string): Observable<any> {
        throw new Error('Method not implemented.');
    }
    public updateInfo(profile: { displayName: string; photoURL: string; }, email: string): Observable<any> {
        throw new Error('Method not implemented.');
    }
    public updatePassword(password: string): Observable<any> {
        throw new Error('Method not implemented.');
    }
    public deleteAccount(): Observable<any> {
        throw new Error('Method not implemented.');
    }
    public signOut(): Observable<any> {
        throw new Error('Method not implemented.');
    }
    public createUser(email: string, password: string): Observable<any> {
        throw new Error('Method not implemented.');
    }
    public checkIfEmailExists(email: string): Observable<boolean> {
        throw new Error('Method not implemented.');
    }
    public verifyEmail(actionCode: string): Observable<void> {
        throw new Error('Method not implemented.');
    }
    public getEmailFromActionCode(actionCode: string): Observable<string> {
        throw new Error('Method not implemented.');
    }

}
