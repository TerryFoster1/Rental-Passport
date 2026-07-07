type RentalPassportLogoProps = {
  compact?: boolean;
  className?: string;
};

export function RentalPassportLogo({ compact = false, className = '' }: RentalPassportLogoProps) {
  return (
    <img
      src={compact ? '/brand/rental-passport-icon.png' : '/brand/rental-passport-logo.png'}
      alt="Rental Passport"
      className={className}
      decoding="async"
      draggable={false}
    />
  );
}
