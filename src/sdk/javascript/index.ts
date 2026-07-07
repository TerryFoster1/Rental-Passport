import { apiV1Endpoints } from '@/api/v1/endpoints';

export const rentalPassportJavaScriptSdkPlan = {
  packageName: '@rentalpassport/sdk',
  language: 'TypeScript',
  status: 'planned',
  endpoints: apiV1Endpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`),
};
