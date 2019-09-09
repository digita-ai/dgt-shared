export class DGTI8NLocale {
    public language: string;
    public country: string;

    constructor(locale: string) {
        const splitLocale: string[] = locale.split('-');

        if (splitLocale && splitLocale.length === 2) {
            this.language = splitLocale[0];
            this.country = splitLocale[1];
        }
    }

    public toString(): string {
        return this.language + '-' + this.country;
    }
}
