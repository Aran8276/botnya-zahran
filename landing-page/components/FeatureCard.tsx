// components/FeatureCard.tsx
import React, { ReactNode } from "react";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-[#2c2f33] p-6 rounded-lg shadow-lg text-left transform transition-all duration-300 hover:-translate-y-2 hover:shadow-teal-500/20">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-xl font-bold text-white ml-4">{title}</h3>
      </div>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default FeatureCard;
