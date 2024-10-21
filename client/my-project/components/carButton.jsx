import React, { useState } from "react";

const CarButton = ({ onClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
    onClick();
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        className="focus:outline-none transition-transform transform hover:scale-110 mb-2 shadow-lg"
        aria-label="Toggle car manual"
      >
        <svg
          width="150"
          height="70"
          viewBox="0 0 150 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-500 ease-in-out"
        >
          {/* Car Body */}
          <path
            d="M15,55 Q20,25 40,25 L110,25 Q130,25 135,55 L15,55 Z"
            fill="#1E40AF"
            className="transition-colors duration-300 ease-in-out"
          />
          {/* Car Shadow */}
          <ellipse cx="75" cy="60" rx="60" ry="6" fill="rgba(0,0,0,0.1)" />
          {/* Windows */}
          <path d="M35,28 L50,28 L50,38 Q40,38 35,36 Z" fill="#93C5FD" />
          <path d="M115,28 L100,28 L100,38 Q110,38 115,36 Z" fill="#93C5FD" />
          <path d="M55,28 L95,28 L98,38 L52,38 Z" fill="#93C5FD" />
          {/* Wheels */}
          <circle cx="40" cy="55" r="10" fill="#111827" />
          <circle cx="110" cy="55" r="10" fill="#111827" />
          {/* Door with Smooth Animation */}
          <path
            d={
              isOpen
                ? "M55,28 L55,52 L95,48 L95,28 Z"
                : "M55,28 L55,52 L57,52 L57,28 Z"
            }
            fill="#2563EB"
            className="transition-all duration-700 ease-in-out"
          />
          {/* Handle */}
          <rect x="85" y="37" width="6" height="3" rx="1" fill="#F3F4F6" />
          {/* Light Reflection */}
          <path
            d="M35,30 Q50,20 75,30"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1"
            className="transition-opacity duration-500 ease-in-out"
            opacity={isOpen ? 0.8 : 0}
          />
        </svg>
      </button>
      <span className="text-sm font-medium text-gray-700 transition-all duration-300 ease-in-out mt-2">
        {isOpen ? "Close Owner's Manual" : "Open Owner's Manual"}
      </span>
    </div>
  );
};

export default CarButton;
