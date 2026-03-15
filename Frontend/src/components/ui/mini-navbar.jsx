import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils.js";

const AnimatedNavLink = ({ href, children, variant = "dark" }) => {
  const isDark = variant === "dark";
  const defaultText = isDark ? "text-gray-300" : "text-slate-700";
  const hoverText = isDark ? "text-white" : "text-slate-900";

  return (
    <a href={href} className="group relative inline-block overflow-hidden h-5 text-sm">
      <div className="flex flex-col leading-none transition-transform duration-300 ease-out transform group-hover:-translate-y-full">
        <span className={cn("h-5 flex items-center", defaultText)}>{children}</span>
        <span className={cn("h-5 flex items-center", hoverText)}>{children}</span>
      </div>
    </a>
  );
};

export default function MiniNavbar({ variant = "dark" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState("rounded-full");
  const shapeTimeoutRef = useRef(null);
  const isDark = variant === "dark";

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass("rounded-xl");
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass("rounded-full");
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const logoElement = (
    <a
      href="/dashboard/"
      className={cn(
        "font-semibold text-lg sm:text-xl tracking-wide transition-shadow",
        isDark
          ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.35)] hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.55)]"
          : "text-slate-900 drop-shadow-[0_0_8px_rgba(15,23,42,0.25)] hover:drop-shadow-[0_0_12px_rgba(15,23,42,0.35)]"
      )}
    >
      Stark
    </a>
  );

  const navLinksData = [
    { label: "Discover", href: "#discover" },
    { label: "Careers", href: "#careers" },
    { label: "About us", href: "#about" },
  ];

  const loginButtonElement = (
    <a
      href="/signin/"
      className={cn(
        "px-4 py-2 sm:px-3 text-xs sm:text-sm border rounded-full transition-colors duration-200 w-full sm:w-auto",
        isDark
          ? "border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 hover:border-white/50 hover:text-white"
          : "border-black/10 bg-white/70 text-slate-700 hover:border-black/30 hover:text-slate-900"
      )}
    >
      LogIn
    </a>
  );

  const signupButtonElement = (
    <div className="relative group w-full sm:w-auto">
      <div
        className={cn(
          "absolute inset-0 -m-2 rounded-full hidden sm:block opacity-40 filter blur-lg pointer-events-none transition-all duration-300 ease-out",
          isDark
            ? "bg-gray-100 group-hover:opacity-60 group-hover:blur-xl group-hover:-m-3"
            : "bg-slate-900/20 group-hover:opacity-50 group-hover:blur-xl group-hover:-m-3"
        )}
      />
      <a
        href="/signup/"
        className={cn(
          "relative z-10 px-4 py-2 sm:px-3 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 w-full sm:w-auto inline-flex items-center justify-center",
          isDark
            ? "text-black bg-gradient-to-br from-gray-100 to-gray-300 hover:from-gray-200 hover:to-gray-400"
            : "text-white bg-gradient-to-br from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
        )}
      >
        Signup
      </a>
    </div>
  );

  return (
    <header
      className={cn(
        "fixed top-6 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center pl-6 pr-6 py-3 backdrop-blur-sm",
        headerShapeClass,
        "w-[calc(100%-2rem)] sm:w-auto transition-[border-radius,backdrop-filter] duration-300 ease-in-out",
        isDark ? "border border-[#333] bg-[#1f1f1f57]" : "border border-black/10 bg-white/70"
      )}
    >
      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-8">
        <div className="flex items-center">{logoElement}</div>

        <nav className={cn("hidden sm:flex items-center space-x-4 sm:space-x-6 text-sm", isDark ? "text-white" : "text-slate-900")}>
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href} variant={variant}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2 sm:gap-3">
          {loginButtonElement}
          {signupButtonElement}
        </div>

        <button
          className={cn(
            "sm:hidden flex items-center justify-center w-8 h-8 focus:outline-none",
            isDark ? "text-gray-300" : "text-slate-700"
          )}
          onClick={toggleMenu}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div
        className={cn(
          "sm:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden",
          isOpen ? "max-h-[1000px] opacity-100 pt-4" : "max-h-0 opacity-0 pt-0 pointer-events-none"
        )}
      >
        <nav className="flex flex-col items-center space-y-4 text-base w-full">
          {navLinksData.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn("transition-colors w-full text-center", isDark ? "text-gray-300 hover:text-white" : "text-slate-700 hover:text-slate-900")}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-4 mt-4 w-full">
          {loginButtonElement}
          {signupButtonElement}
        </div>
      </div>
    </header>
  );
}
