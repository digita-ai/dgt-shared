/**
 * The different modes a trusted app can be granted.
 */
export enum DGTSourceSolidTrustedAppMode {
    READ = 'http://www.w3.org/ns/auth/acl#Read',
    APPEND = 'http://www.w3.org/ns/auth/acl#Append',
    CONTROL = 'http://www.w3.org/ns/auth/acl#Control',
    WRITE = 'http://www.w3.org/ns/auth/acl#Write',
}
