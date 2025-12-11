import Image from 'next/image';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Image
      src="/logo.webp"
      alt="k-ID Logo"
      width={48}
      height={48}
      className={`w-12 h-12 ${className}`}
      style={{
        filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(246deg) brightness(91%) contrast(101%)'
      }}
      priority
    />
  );
}




