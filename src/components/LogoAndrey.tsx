import React, { useState } from 'react';

interface LogoAndreyProps {
  className?: string;
  alt?: string;
}

export const LogoAndrey: React.FC<LogoAndreyProps> = ({
  className = 'w-12 h-12',
  alt = 'Logotipo Alfajoraria Andrey - Onde nasce o sabor',
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <img
      src={hasError ? '/logo_andrey.svg' : '/logo_andrey_novo.jpg'}
      alt={alt}
      onError={() => setHasError(true)}
      className={`object-cover bg-[#FAF5EB] ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
