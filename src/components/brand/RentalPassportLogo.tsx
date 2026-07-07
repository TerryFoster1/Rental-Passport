type RentalPassportLogoProps = {
  compact?: boolean;
  className?: string;
};

export function RentalPassportLogo({ compact = false, className = '' }: RentalPassportLogoProps) {
  return (
    <img
      src={compact ? '/brand/rental-passport-icon.svg' : '/brand/rental-passport-logo.svg'}
      alt="Rental Passport"
      className={className}
      decoding="async"
      draggable={false}
    />
  );
}
