import { DGTConnectionSolid, DGTConnectionState, DGTEvent, DGTExchange, DGTProfile, DGTSource, DGTSourceSolid, DGTSourceSolidConfiguration } from '@digita-ai/dgt-shared-data';
import { DGTNotificationType } from '@digita-ai/dgt-shared-web';
import moment from 'moment';

export const mockSource1 = {
  exchange: null,
  triples: null,
  uri: '1',
  icon: 'fas fa-users',
  description: 'Inrupt',
  type: '1',
  configuration: {
    issuer: 'https://inrupt.net',
  } as DGTSourceSolidConfiguration,
} as DGTSourceSolid;

export const mockSource2 = {
  exchange: null,
  triples: null,
  uri: '2',
  icon: 'fas fa-users',
  description: 'Inrupt',
  type: '1',
  configuration: {
    issuer: 'https://inrupt.net',
  } as DGTSourceSolidConfiguration,
} as DGTSourceSolid;

export const mockSource3 = {
  exchange: null,
  triples: null,
  uri: '3',
  description: 'test-description',
  type: '1',
  configuration: {
    issuer: 'https://inrupt.net',
  } as DGTSourceSolidConfiguration,
} as DGTSourceSolid;

export const mockConnection1 = {
  exchange: null,
  triples: null,
  uri: '1',
  configuration: {
    protocol: 'https://',
  },
  state: DGTConnectionState.CONNECTED,
  source: mockSource3.uri,
} as DGTConnectionSolid;

export const mockConnection2 = {
  exchange: null,
  triples: null,
  uri: '2',
  configuration: null,
  state: DGTConnectionState.CONNECTING,
  source: mockSource3.uri,
} as DGTConnectionSolid;

export const mockConnection3 = {
  exchange: null,
  triples: null,
  uri: '3',
  configuration: null,
  state: DGTConnectionState.CONNECTED,
  source: mockSource2.uri,
} as DGTConnectionSolid;

export const mockExchange1: DGTExchange = {
  exchange: null,
  triples: null,
  uri: '1',
  source: mockSource3.uri,
  connection: mockConnection1.uri,
  purpose: null,
  holder: null,
}

export const mockExchange2: DGTExchange = {
  exchange: null,
  triples: null,
  uri: '2',
  source: mockSource2.uri,
  connection: mockConnection3.uri,
  purpose: null,
  holder: null,
}

export const mockExchange3: DGTExchange = {
  exchange: null,
  triples: null,
  uri: '3',
  source: '1',
  connection: mockConnection2.uri,
  purpose: null,
  holder: null,
}

export const mockExchange4: DGTExchange = {
  exchange: null,
  triples: null,
  uri: '4',
  source: '1',
  connection: mockConnection1.uri,
  purpose: null,
  holder: null,
}

export const mockProfile1 = {
  uri: '1',
  fullName: 'profile 1',
  avatar: 'https://bla/bla1.png',
  exchange: mockExchange1.uri,
} as DGTProfile;

export const mockProfile2 = {
  uri: '2',
  fullName: 'profile 2',
  avatar: 'https://bla/bla2.png',
  exchange: mockExchange2.uri,
} as DGTProfile;

export const mockLoginData = {
  username: 'testusername',
  name: 'testusername',
  email: 'test@email.com',
  password: 'TESTtest1324-',
}

export const mockSources = [
  {
    exchange: null,
    triples: null,
    uri: '1',
    icon: 'fas fa-users',
    description: 'Solid Community',
    type: '1',
    configuration: {
      issuer: 'https://solid.community',
    },
  } as DGTSource<any>,
  mockSource2,
  mockSource3,
] as DGTSourceSolid[];

export const mockConnections = [
  mockConnection1,
  mockConnection2,
  mockConnection3,
];

export const mockProfiles = [
  mockProfile1,
  mockProfile2,
];

export const mockExchanges = [
  mockExchange1,
  mockExchange2,
  mockExchange3,
  mockExchange4,
]

export const dateJustNow = new Date(Date.now());

export const dateOneHourAgo = moment().subtract(1, 'hour').toDate();

export const dateTenHoursAgo = moment().subtract(10, 'hours').toDate();

export const dateYesterday = moment().subtract(1, 'day').toDate();

export const datePast = moment().subtract(3, 'days').toDate();

export const eventJustNow = {
  uri: 'event-just-now',
  date: dateJustNow,
  stakeholder: 'digita-test-one',
  description: 'test-description-one',
  icon: 'url-to-image-one',
  stakeholderUri: 'https://digita.ai',
  exchange: mockExchange1.uri,
  triples: null,
} as DGTEvent;

export const event1HourAgo = {
  uri: 'event-one-hour-ago',
  date: dateOneHourAgo,
  stakeholder: 'digita-test-two',
  description: 'test-description-two',
  icon: 'url-to-image-two',
  stakeholderUri: 'https://digita.ai',
  exchange: mockExchange1.uri,
  triples: null,
} as DGTEvent;

export const event10HoursAgo = {
  uri: 'event-ten-hours-ago',
  date: dateTenHoursAgo,
  stakeholder: 'digita-test-three',
  description: 'test-description-three',
  icon: 'url-to-image-three',
  stakeholderUri: 'https://digita.ai',
  exchange: mockExchange1.uri,
  triples: null,
} as DGTEvent;

export const eventYesterday = {
  uri: 'event-yesterday',
  date: dateYesterday,
  stakeholder: 'digita-test-four',
  description: 'test-description-four',
  icon: 'url-to-image-four',
  stakeholderUri: 'https://digita.ai',
  exchange: mockExchange1.uri,
  triples: null,
} as DGTEvent;

export const eventPast = {
  uri: 'event-past',
  date: datePast,
  stakeholder: 'digita-test-five',
  description: 'test-description-five',
  icon: 'url-to-image-five',
  stakeholderUri: 'https://digita.ai',
  exchange: mockExchange1.uri,
  triples: null,
} as DGTEvent;

export const eventToTestAdd = {
  uri: 'event-to-test-add',
  date: dateJustNow,
  stakeholder: 'digita-test-six',
  description: 'test-description-six',
  icon: 'url-to-image-six',
  stakeholderUri: 'https://digita.ai',
  exchange: mockExchange1.uri,
  triples: null,
} as DGTEvent;

export const eventListToday = [
  eventJustNow,
  event1HourAgo,
  event10HoursAgo,
] as DGTEvent[];

export const eventListYesterday = [
  eventYesterday,
] as DGTEvent[];

export const eventListPast = [
  eventPast,
] as DGTEvent[];

export const mockEvents = [
  ...eventListToday,
  ...eventListYesterday,
  ...eventListPast,
] as DGTEvent[];

export const mockNotification1Ttl1 = {
  type: DGTNotificationType.INFO,
  message: 'mockNotification1Ttl1',
  ttl: 1,
}

export const mockNotification2Ttl1 = {
  type: DGTNotificationType.SUCCESS,
  message: 'mockNotification2Ttl1',
  ttl: 1,
}

export const mockNotification3Ttl1 = {
  type: DGTNotificationType.DANGER,
  message: 'mockNotification3Ttl1',
  ttl: 1,
}
export const mockNotification1Ttl2 = {
  type: DGTNotificationType.INFO,
  message: 'mockNotification1Ttl2',
  ttl: 2,
}

export const mockNotification2Ttl2 = {
  type: DGTNotificationType.SUCCESS,
  message: 'mockNotification2Ttl2',
  ttl: 2,
}

export const mockNotification3Ttl2 = {
  type: DGTNotificationType.DANGER,
  message: 'mockNotification3Ttl2',
  ttl: 2,
}

export const mockNotificationsTtl1 = [
  mockNotification1Ttl1,
  mockNotification2Ttl1,
  mockNotification3Ttl1,
];
export const mockNotificationsTtl2 = [
  mockNotification1Ttl2,
  mockNotification2Ttl2,
  mockNotification3Ttl2,
];

export const mockNotifications = [
  ...mockNotificationsTtl1,
  ...mockNotificationsTtl2,
]
