import {
    DGTCategory,
    DGTLDFilterBGP,
    DGTLDFilterType,
    DGTLDNode,
    DGTLDResource,
    DGTLDTermType,
    DGTLDTriple,
} from '@digita-ai/dgt-shared-data';
import { DGTDataGroup } from '@digita-ai/dgt-shared-data';
import { DGTI8NLocale } from './lib/i8n/models/dgt-i8n-locale.model';
import { mockConnection1, mockConnection2, mockExchange3, mockExchange4, mockSource2 } from './test.events.mock-data';

export const mockCategoryName = {
    exchange: null,
    triples: null,
    title: 'name',
    uri: 'name',
    description: 'Name',
    icon: 'fas fa-user',
    groupId: 'identity',
    filter: {
        type: DGTLDFilterType.BGP,
        predicates: [
            'http://www.w3.org/2006/vcard/ns#honorific-prefix',
            'http://www.w3.org/2006/vcard/ns#fn',
            'http://xmlns.com/foaf/0.1/name',
            'http://xmlns.com/foaf/0.1/nick',
        ],
    } as DGTLDFilterBGP,
} as DGTCategory;
export const mockCategoryEmail = {
    exchange: null,
    triples: null,
    title: 'email',
    uri: 'email',
    description: 'Email Address',
    icon: 'fas fa-envelope',
    groupId: 'contact',
    filter: {
        type: DGTLDFilterType.BGP,
        predicates: [
            'http://www.w3.org/2006/vcard/ns#hasEmail',
            'http://www.w3.org/2006/vcard/ns#value',
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        ],
    } as DGTLDFilterBGP,
} as DGTCategory;
export const mockCategoryPhone = {
    exchange: null,
    triples: null,
    title: 'phone',
    uri: 'phone',
    description: 'Phone',
    icon: 'fas fa-envelope',
    groupId: 'contact',
    filter: {
        type: DGTLDFilterType.BGP,
        predicates: ['http://www.w3.org/2006/vcard/ns#hasTelephone'],
    } as DGTLDFilterBGP,
} as DGTCategory;

// MOCK PREDICATES
export const mockPredicateResource = 'http://www.w3.org/2006/vcard/ns#value';
export const mockPredicateName = 'http://xmlns.com/foaf/0.1/name';
export const mockPredicateRole = 'http://www.w3.org/2006/vcard/ns#role';
export const mockPredicateHasPhone = 'http://www.w3.org/2006/vcard/ns#hasTelephone';
export const mockPredicateHasEmail = 'http://www.w3.org/2006/vcard/ns#hasEmail';
export const mockPredicateType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

// MOCK NODES
export const mockNodeString = {
    dataType: 'http://www.w3.org/2001/XMLSchema#string',
    termType: DGTLDTermType.LITERAL,
    value: 'test-value',
} as DGTLDNode;
export const mockNodePhone = {
    termType: DGTLDTermType.LITERAL,
    value: 'tel:+32479876543',
} as DGTLDNode;
export const mockNodeEmail = {
    termType: DGTLDTermType.LITERAL,
    value: 'mailto:jip@janneke.be',
} as DGTLDNode;
export const mockNodeProfileReference = {
    value: 'https://digitatest.inrupt.net/profile/card#me',
    termType: DGTLDTermType.REFERENCE,
} as DGTLDNode;
export const mockNodeTypeWork = {
    value: 'http://www.w3.org/2006/vcard/ns#Work',
    termType: DGTLDTermType.REFERENCE,
} as DGTLDNode;
export const mockNodeReference = {
    value: 'https://digitest.inrupt.net/profile/card#id1589374258090',
    termType: DGTLDTermType.REFERENCE,
} as DGTLDNode;

// MOCK VALUES
export const mockResourceName = {
    uri: 'test-name',
    exchange: mockExchange3.uri,
    subject: mockNodeProfileReference,
    object: mockNodeString,
    predicate: mockPredicateName,
    triples: [
        {
            uri: 'test-value-name',
            connection: mockConnection2.uri,
            source: mockSource2.uri,
            predicate: mockPredicateName,
            subject: mockNodeProfileReference,
            object: mockNodeString,
        } as DGTLDTriple,
    ],
} as DGTLDResource;
export const mockResourcePhone = {
    exchange: mockExchange3.uri,
    triples: [
        {
            uri: 'test-value-phone',
            connection: mockConnection2.uri,
            source: mockSource2.uri,
            predicate: mockPredicateResource,
            subject: mockNodeReference,
            object: mockNodePhone,
        } as DGTLDTriple,
    ],
} as DGTLDResource;
export const mockResourceEmail = {
    uri: 'test-value-email',
    exchange: mockExchange4.uri,
    object: mockNodeEmail,
    predicate: mockPredicateResource,
    subject: mockNodeReference,
    triples: [
        {
            uri: 'test-value-email',
            connection: mockConnection1.uri,
            source: mockSource2.uri,
            predicate: mockPredicateResource,
            subject: mockNodeReference,
            object: mockNodeEmail,
        } as DGTLDTriple,
    ],
} as DGTLDResource;
export const mockResourceEmailUpdated = {
    uri: 'test-value-email',
    exchange: mockExchange4.uri,
    object: mockNodeEmail,
    predicate: mockPredicateResource,
    subject: mockNodeReference,
    triples: [
        {
            uri: 'test-value-email',
            connection: mockConnection1.uri,
            source: mockSource2.uri,
            predicate: mockPredicateResource,
            subject: mockNodeReference,
            object: { ...mockNodeEmail, value: 'suske.wiske@stripboek.be' },
        } as DGTLDTriple,
    ],
} as DGTLDResource;
export const mockResourceRole = {
    uri: 'test-role',
    exchange: mockExchange3.uri,
    subject: mockNodeProfileReference,
    object: mockNodeString,
    predicate: mockPredicateRole,
    triples: [
        {
            uri: 'test-value-role',
            connection: mockConnection1.uri,
            source: mockSource2.uri,
            predicate: mockPredicateRole,
            subject: mockNodeProfileReference,
            object: mockNodeString,
        } as DGTLDTriple,
    ],
} as DGTLDResource;
export const mockResources = [mockResourceName, mockResourcePhone, mockResourceEmail] as DGTLDResource[];

// MOCK REFERENCES
export const mockReferencePhone = {
    connection: '2',
    // uri: mockNodeProfileReference.value,
    exchange: null,
    uri: 'test-reference-phone',
    object: mockNodeReference,
    originalValue: mockNodeReference,
    predicate: mockPredicateHasPhone,
    source: '1',
    subject: mockNodeProfileReference,
    triples: [
        {
            uri: 'test-value-reference-phone',
            connection: mockConnection1.uri,
            source: mockSource2.uri,
            predicate: mockPredicateHasPhone,
            subject: mockNodeProfileReference,
            object: mockNodeReference,
        } as DGTLDTriple,
    ],
} as DGTLDResource;
export const mockReferenceEmail = {
    connection: '2',
    // uri: mockNodeProfileReference.value,
    exchange: null,
    uri: 'test-reference-email',
    object: mockNodeReference,
    originalValue: mockNodeReference,
    predicate: mockPredicateHasEmail,
    source: '1',
    subject: mockNodeProfileReference,
    triples: [
        {
            uri: 'test-value-reference-phone',
            connection: mockConnection1.uri,
            source: mockSource2.uri,
            predicate: mockPredicateHasEmail,
            subject: mockNodeProfileReference,
            object: mockNodeReference,
        } as DGTLDTriple,
    ],
} as DGTLDResource;

// MOCK OTHERS
export const mockTypeWork = {
    exchange: mockExchange3.uri,
    uri: 'test-value-phone',
    triples: [
        {
            uri: 'test-value-phone',
            connection: mockConnection1.uri,
            source: mockSource2.uri,
            predicate: mockPredicateType,
            subject: mockNodeReference,
            object: mockNodeTypeWork,
        } as DGTLDTriple,
    ],
} as DGTLDResource;
export const mockGroupIdentiy = {
    uri: 'test-group-identity',
    description: 'Test Group Identity',
} as DGTDataGroup;

export const mockLocale1 = {
    language: 'en',
    country: 'us',
} as DGTI8NLocale;
