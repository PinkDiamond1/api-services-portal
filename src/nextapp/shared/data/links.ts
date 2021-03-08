export interface NavLink {
  name: string;
  url: string;
  access: string[];
}

const links: NavLink[] = [
  { name: 'Home', url: '/home', access: [] },
  {
    name: 'API Discovery',
    url: '/poc/api-discovery',
    access: ['developer', 'api-owner'],
  },
  {
    name: 'Applications',
    url: '/poc/applications',
    access: ['developer', 'api-owner'],
  },
  { name: 'Services', url: '/poc/services', access: ['api-owner'] },
  { name: 'Consumers', url: '/poc/consumers', access: ['api-owner'] },
  {
    name: 'Access Requests',
    url: '/poc/requests',
    access: ['api-owner', 'api-manager', 'credential-admin'],
  },
  { name: 'Products', url: '/products', access: ['api-owner'] },
  {
    name: 'Credential Issuers',
    url: '/poc/credential-issuers',
    access: ['credential-admin'],
  },
  {
    name: 'Service Accounts',
    url: '/poc/service-accounts',
    access: ['api-owner'],
  },
  { name: 'Documentation', url: '/docs', access: [] },
  { name: 'APS Admin', url: '/admin', access: ['aps-admin'] },
  { name: 'POC Products', url: '/poc/packagingv1', access: ['aps-admin'] },
  { name: 'Activity', url: '/poc/activity', access: ['api-owner'] },
];

export default links;
