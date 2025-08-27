'use client';

import { useEffect, useState } from 'react';

interface ClientDateProps {
  date: string | Date;
  className?: string;
  options?: Intl.DateTimeFormatOptions; // Allow custom formatting options
}

const ClientDate: React.FC<ClientDateProps> = ({ 
  date, 
  className,
  options = {} // Default empty options
}) => {
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const dateObj = new Date(date);
    setFormattedDate(dateObj.toLocaleDateString(undefined, options));
  }, [date, options]);

  // Show loading state or placeholder during SSR
  if (!isClient || !formattedDate) {
    return <span className={className} aria-label="Loading date">—</span>;
  }

  return <span className={className}>{formattedDate}</span>;
};

export default ClientDate;