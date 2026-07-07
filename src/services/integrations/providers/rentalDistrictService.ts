export type RentalDistrictHandoff = {
  applicationId: string;
  passportId: string;
  acceptedAt: string;
  status: 'prepared_not_sent';
};

export function prepareRentalDistrictHandoff(applicationId: string, passportId: string): RentalDistrictHandoff {
  return {
    applicationId,
    passportId,
    acceptedAt: new Date().toISOString(),
    status: 'prepared_not_sent',
  };
}
