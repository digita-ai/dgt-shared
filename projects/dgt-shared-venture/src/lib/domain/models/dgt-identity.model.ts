import { DGTProfileGender } from './dgt-profile-gender.model';

export interface DGTIdentity {
    name: string,
    firstName: string,
    callName: string,
    gender: DGTProfileGender,
    nationality: string,
    placeOfBirth: string,
    dateOfBirth: Date,
}
