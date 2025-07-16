import Link from 'next/link';
import React, { ReactNode } from "react";

type NavButtonProps = {
  children: ReactNode;
  href: string;
  external?: boolean;
};

export default function NavButton({ children, href, external = false }: NavButtonProps) {
  const commonClasses = "flex items-center gap-2 py-2 px-4 bg-transparent text-gray-300 rounded-lg cursor-pointer font-medium text-center transition-all duration-300 hover:bg-gray-700 hover:text-white";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={commonClasses}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={commonClasses}>
      {children}
    </Link>
  );
}