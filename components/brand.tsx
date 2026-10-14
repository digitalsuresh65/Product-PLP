import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex shrink-0 items-center"
      aria-label="A&A Fashion Boutique home"
    >
      <Image
        src="/brand/aa-fashion-boutique-logo.png"
        alt="A&A Fashion Boutique"
        width={346}
        height={84}
        priority
        className={`h-auto object-contain object-left transition-opacity group-hover:opacity-80 ${
          compact ? "w-36" : "w-[190px] sm:w-[230px]"
        }`}
      />
    </Link>
  );
}
