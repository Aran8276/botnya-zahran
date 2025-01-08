import Link from "next/link";
import React from "react";

interface SelfProps {
  children: React.ReactNode;
  href: string;
}

export default function SocialMedia(props: SelfProps) {
  return (
    <div>
      <Link
        target="_blank"
        href={props.href}
        className="p-2 rounded-lg flex items-center border border-gray-300 justify-center transition-all duration-500 hover:border-gray-100 hover:bg-gray-100"
      >
        {props.children}
      </Link>
    </div>
  );
}
