"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Toss Design System (TDS) style flat-vector illustrations.
 * Built with Toss 2-3 hue palette: Toss Blue (#0064FF), Tint (#E8F3FF),
 * Warm Amber (#FF9500), Soft Mint (#00C896), Coral Red (#FF4040),
 * and Toss neutral grayscale (#191F28, #8B95A1, #D1D6DB, #F2F4F6).
 */

// 1. Hot Americano / Coffee Cup
export function AmericanoIllustration({ className, size = 48, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#FFF4E6" />
      {/* Coffee Cup */}
      <path
        d="M20 25C20 22.7909 21.7909 21 24 21H38C40.2091 21 42 22.7909 42 25V36C42 41.5228 37.5228 46 32 46C26.4772 46 22 41.5228 22 36L20 25Z"
        fill="#8B572A"
      />
      {/* Cup highlight */}
      <path
        d="M22 25C22 23.8954 22.8954 23 24 23H38C39.1046 23 40 23.8954 40 25V35C40 39.4183 36.4183 43 32 43C27.5817 43 24 39.4183 24 35L22 25Z"
        fill="#A0693B"
      />
      {/* Steam curves */}
      <path
        d="M28 17C28 15.5 29 14.5 29 13M34 17C34 15 35 14 35 12.5"
        stroke="#FF9500"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Cup Handle */}
      <path
        d="M40 27H43C45.2091 27 47 28.7909 47 31V33C47 35.2091 45.2091 37 43 37H39.5"
        stroke="#8B572A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Saucer */}
      <path
        d="M18 47C22 49 42 49 46 47"
        stroke="#D1D6DB"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 2. Cafe Latte / Milk Coffee
export function LatteIllustration({ className, size = 48, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#FBF0E4" />
      {/* Glass cup */}
      <path
        d="M21 19H43L39.5 44.5C39.2 46.5 37.5 48 35.5 48H28.5C26.5 48 24.8 46.5 24.5 44.5L21 19Z"
        fill="#E5E8EB"
      />
      {/* Espresso bottom layer */}
      <path
        d="M23.5 36H40.5L39.5 44.5C39.2 46.5 37.5 48 35.5 48H28.5C26.5 48 24.8 46.5 24.5 44.5L23.5 36Z"
        fill="#7A4B20"
      />
      {/* Milk layer */}
      <path d="M22.5 27H41.5L40.5 36H23.5L22.5 27Z" fill="#FDF3E7" />
      {/* Foam top */}
      <path
        d="M21 20C21 18.5 23 17 32 17C41 17 43 18.5 43 20H21Z"
        fill="#FFFFFF"
      />
      {/* Heart latte art */}
      <path
        d="M32 24C32 24 30 21 28.5 22C27 23 28 25 32 27C36 25 37 23 35.5 22C34 21 32 24 32 24Z"
        fill="#A0693B"
      />
    </svg>
  );
}

// 3. Iced Vanilla Latte / Cold Coffee
export function ColdLatteIllustration({ className, size = 48, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#E8F3FF" />
      {/* Cold Cup Body */}
      <path
        d="M21 18H43L39.8 45.2C39.5 47.3 37.8 49 35.6 49H28.4C26.2 49 24.5 47.3 24.2 45.2L21 18Z"
        fill="#C8DDF8"
      />
      {/* Coffee Fill */}
      <path
        d="M22 25H42L39.5 44.5C39.2 46.5 37.5 48 35.5 48H28.5C26.5 48 24.8 46.5 24.5 44.5L22 25Z"
        fill="#9C6B3E"
      />
      {/* Vanilla Cream Layer */}
      <path
        d="M22 25H42L41 33C37 32 27 34 23 33L22 25Z"
        fill="#FFF7E6"
      />
      {/* Ice Cubes */}
      <rect x="25" y="27" width="6" height="6" rx="1.5" fill="#FFFFFF" fillOpacity="0.75" />
      <rect x="33" y="29" width="6" height="6" rx="1.5" fill="#FFFFFF" fillOpacity="0.75" />
      {/* Straw */}
      <path d="M37 11L33 28" stroke="#0064FF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// 4. Matcha Latte
export function MatchaIllustration({ className, size = 48, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#E8F8EE" />
      {/* Cup Body */}
      <path
        d="M21 21H43L39.8 45.2C39.5 47.3 37.8 49 35.6 49H28.4C26.2 49 24.5 47.3 24.2 45.2L21 21Z"
        fill="#D2EFE0"
      />
      {/* Matcha Green Liquid */}
      <path
        d="M22 27H42L39.5 44.5C39.2 46.5 37.5 48 35.5 48H28.5C26.5 48 24.8 46.5 24.5 44.5L22 27Z"
        fill="#38A169"
      />
      {/* Milk swirl */}
      <path
        d="M22 27H42L41 33C36 31 28 34 23 32L22 27Z"
        fill="#FFFFFF"
      />
      {/* Green Tea Leaf */}
      <path
        d="M32 15C29 18 29 21 32 23C35 21 35 18 32 15Z"
        fill="#00A85A"
      />
    </svg>
  );
}

// 5. Strawberry / Fruit Ade
export function StrawberryAdeIllustration({ className, size = 48, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#FFE8E8" />
      {/* Glass Body */}
      <path
        d="M21 19H43L39.8 45.2C39.5 47.3 37.8 49 35.6 49H28.4C26.2 49 24.5 47.3 24.2 45.2L21 19Z"
        fill="#FFD2D2"
      />
      {/* Strawberry Ade Red Gradient / Liquid */}
      <path
        d="M22 25H42L39.5 44.5C39.2 46.5 37.5 48 35.5 48H28.5C26.5 48 24.8 46.5 24.5 44.5L22 25Z"
        fill="#FF4D6D"
      />
      {/* Soda Sparkles / Bubbles */}
      <circle cx="28" cy="38" r="2" fill="#FFFFFF" fillOpacity="0.8" />
      <circle cx="35" cy="32" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
      <circle cx="31" cy="42" r="1.2" fill="#FFFFFF" fillOpacity="0.8" />
      {/* Strawberry slice */}
      <circle cx="30" cy="27" r="4" fill="#E60039" />
      <circle cx="30" cy="27" r="2.5" fill="#FFA3B5" />
      {/* Straw */}
      <path d="M38 12L34 26" stroke="#0064FF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// 6. Lemonade / Citrus Juice
export function LemonadeIllustration({ className, size = 48, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#FFFDE6" />
      {/* Glass */}
      <path
        d="M21 19H43L39.8 45.2C39.5 47.3 37.8 49 35.6 49H28.4C26.2 49 24.5 47.3 24.2 45.2L21 19Z"
        fill="#FFF9B8"
      />
      {/* Lemon Liquid */}
      <path
        d="M22 25H42L39.5 44.5C39.2 46.5 37.5 48 35.5 48H28.5C26.5 48 24.8 46.5 24.5 44.5L22 25Z"
        fill="#FFD600"
      />
      {/* Lemon Wheel on Rim */}
      <circle cx="24" cy="18" r="6" fill="#FFB300" />
      <circle cx="24" cy="18" r="4.5" fill="#FFF176" />
      {/* Straw */}
      <path d="M37 11L33 26" stroke="#00A85A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// 7. Basque Cheesecake
export function CheesecakeIllustration({ className, size = 48, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#FFF6EB" />
      {/* Cake Plate */}
      <ellipse cx="32" cy="46" rx="20" ry="6" fill="#E5E8EB" />
      {/* Cake Triangle Slice */}
      <path
        d="M17 38L32 20L47 38H17Z"
        fill="#FFD285"
      />
      {/* Burnt Top Crust */}
      <path
        d="M32 20L47 38H41L32 24L23 38H17L32 20Z"
        fill="#663A16"
      />
      {/* Creamy Cheese Side */}
      <path
        d="M17 38H47V42C47 43.1 46.1 44 45 44H19C17.9 44 17 43.1 17 42V38Z"
        fill="#F6C358"
      />
      {/* Berry Accent */}
      <circle cx="32" cy="18" r="3.5" fill="#E60039" />
    </svg>
  );
}

// 8. Chocolate Chip Cookie
export function CookieIllustration({ className, size = 48, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#FFF0E0" />
      {/* Cookie Body */}
      <circle cx="32" cy="32" r="16" fill="#DE9B52" />
      <circle cx="32" cy="32" r="14.5" fill="#E8B06F" />
      {/* Chocolate Chips */}
      <circle cx="26" cy="27" r="2.5" fill="#522E0E" />
      <circle cx="37" cy="26" r="2.2" fill="#522E0E" />
      <circle cx="33" cy="35" r="2.7" fill="#522E0E" />
      <circle cx="25" cy="38" r="2" fill="#522E0E" />
      <circle cx="39" cy="37" r="2.2" fill="#522E0E" />
    </svg>
  );
}

// 9. Club Sandwich
export function SandwichIllustration({ className, size = 48, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#EBF9F1" />
      {/* Bread Top */}
      <path d="M16 26L48 26L32 14L16 26Z" fill="#DFA869" />
      {/* Lettuce Green */}
      <path d="M14 26H50C50 28.5 48 30 45 30H19C16 30 14 28.5 14 26Z" fill="#00A85A" />
      {/* Tomato Red */}
      <rect x="18" y="30" width="28" height="3" rx="1.5" fill="#FF4D6D" />
      {/* Cheese Yellow */}
      <path d="M16 33L48 33L45 36L19 36L16 33Z" fill="#FFB703" />
      {/* Ham / Meat */}
      <rect x="18" y="36" width="28" height="3.5" rx="1.5" fill="#C85A3A" />
      {/* Bread Bottom */}
      <path d="M16 39.5H48V44C48 46.2 46.2 48 44 48H20C17.8 48 16 46.2 16 44V39.5Z" fill="#DFA869" />
    </svg>
  );
}

// 10. Egg Brunch Plate
export function BrunchIllustration({ className, size = 48, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#F4F6F8" />
      {/* Plate */}
      <circle cx="32" cy="32" r="18" fill="#FFFFFF" stroke="#E5E8EB" strokeWidth="2" />
      {/* Fried Egg White */}
      <path
        d="M28 26C31 23 37 24 38 27C39 30 41 33 38 36C35 39 29 38 26 35C23 32 25 29 28 26Z"
        fill="#F8F9FA"
        stroke="#E5E8EB"
        strokeWidth="1.5"
      />
      {/* Egg Yolk */}
      <circle cx="32" cy="30" r="5" fill="#FF9500" />
      {/* Bacon strip */}
      <path
        d="M20 40C25 38 27 42 33 39C39 36 41 40 44 38"
        stroke="#A73824"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Herb garnish */}
      <circle cx="23" cy="24" r="1.5" fill="#00A85A" />
      <circle cx="26" cy="22" r="1.2" fill="#00A85A" />
    </svg>
  );
}

// 11. Empty Cart Toss State
export function EmptyCartIllustration({ className, size = 120, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
      {...props}
    >
      {/* Soft Blue Glow Aura */}
      <circle cx="60" cy="60" r="46" fill="#E8F3FF" />
      <circle cx="60" cy="60" r="36" fill="#D6E8FF" fillOpacity="0.6" />
      {/* Toss Box / Shopping Basket */}
      <path
        d="M36 48H84L78 84C77.5 87 75 89 72 89H48C45 89 42.5 87 42 84L36 48Z"
        fill="#0064FF"
      />
      {/* Box flap / rim */}
      <path
        d="M32 44C32 41.8 33.8 40 36 40H84C86.2 40 88 41.8 88 44V48H32V44Z"
        fill="#0050D9"
      />
      {/* Basket handles */}
      <path
        d="M48 40V32C48 27.5 51.5 24 56 24H64C68.5 24 72 27.5 72 32V40"
        stroke="#003EA8"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Floating Sparkles */}
      <path
        d="M86 30L88 35L93 37L88 39L86 44L84 39L79 37L84 35L86 30Z"
        fill="#FF9500"
      />
      <circle cx="34" cy="66" r="2.5" fill="#00A85A" />
      <circle cx="88" cy="74" r="3" fill="#FF4040" />
    </svg>
  );
}

// 12. Staff Call Bell Illustration
export function StaffBellIllustration({ className, size = 80, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="40" cy="40" r="32" fill="#E8F3FF" />
      {/* Ripple Rings */}
      <circle cx="40" cy="40" r="24" fill="#C2DCFF" fillOpacity="0.5" />
      {/* Bell Body */}
      <path
        d="M40 22C33.3726 22 28 27.3726 28 34V46C28 47.5 26.5 49 25 50H55C53.5 49 52 47.5 52 46V34C52 27.3726 46.6274 22 40 22Z"
        fill="#0064FF"
      />
      {/* Bell Top Handle */}
      <path d="M40 18V22" stroke="#0050D9" strokeWidth="4" strokeLinecap="round" />
      {/* Clapper */}
      <circle cx="40" cy="54" r="3.5" fill="#003EA8" />
    </svg>
  );
}

// 13. Toss Success / Order Complete Celebration
export function SuccessCheckIllustration({ className, size = 88, ...props }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
      {...props}
    >
      {/* Soft Blue Glow Aura */}
      <circle cx="44" cy="44" r="40" fill="#E8F3FF" />
      <circle cx="44" cy="44" r="32" fill="#0064FF" />
      {/* Crisp White Checkmark */}
      <path
        d="M30 45L39 54L58 35"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Illustration mapping by product icon identifier (lib/data/menu.json).
 */
export function getProductIllustration(iconName: string): React.ComponentType<IllustrationProps> {
  switch (iconName) {
    case "Coffee":
      return AmericanoIllustration;
    case "Milk":
      return LatteIllustration;
    case "CupSoda":
      return ColdLatteIllustration;
    case "Leaf":
      return MatchaIllustration;
    case "Candy":
      return StrawberryAdeIllustration;
    case "Citrus":
      return LemonadeIllustration;
    case "CakeSlice":
      return CheesecakeIllustration;
    case "Cookie":
      return CookieIllustration;
    case "Sandwich":
      return SandwichIllustration;
    case "EggFried":
      return BrunchIllustration;
    default:
      return AmericanoIllustration;
  }
}

export function ProductIllustration({
  icon,
  size = 48,
  className,
  ...props
}: { icon: string; size?: number | string; className?: string } & React.SVGProps<SVGSVGElement>) {
  switch (icon) {
    case "Coffee":
      return <AmericanoIllustration size={size} className={className} {...props} />;
    case "Milk":
      return <LatteIllustration size={size} className={className} {...props} />;
    case "CupSoda":
      return <ColdLatteIllustration size={size} className={className} {...props} />;
    case "Leaf":
      return <MatchaIllustration size={size} className={className} {...props} />;
    case "Candy":
      return <StrawberryAdeIllustration size={size} className={className} {...props} />;
    case "Citrus":
      return <LemonadeIllustration size={size} className={className} {...props} />;
    case "CakeSlice":
      return <CheesecakeIllustration size={size} className={className} {...props} />;
    case "Cookie":
      return <CookieIllustration size={size} className={className} {...props} />;
    case "Sandwich":
      return <SandwichIllustration size={size} className={className} {...props} />;
    case "EggFried":
      return <BrunchIllustration size={size} className={className} {...props} />;
    default:
      return <AmericanoIllustration size={size} className={className} {...props} />;
  }
}

