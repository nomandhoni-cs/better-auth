import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#040404] text-white relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/landingpageBg.png"
          alt="Landing page background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main content */}
      <main className="relative flex items-center justify-center min-h-screen px-6">
        <div className="flex items-center justify-between w-full max-w-7xl">
          {/* Left side - Text content */}
          <div className="flex-1">
            <h1 className="text-[10rem] font-normal tracking-wide text-white leading-none mb-4">
              Orchestra
            </h1>
            <p className="text-[#4ade80] text-2xl font-light tracking-wide mb-8">
              Your all in one Saas Queuing Solution
            </p>

            {/* Buttons */}
            <div className="flex gap-6">
              <Link
                href="/sign-in"
                className="px-8 py-3 bg-[#030303]  border border-white/20 rounded-lg text-white hover:bg-[#44cc00]/20 transition-all duration-300 text-lg font-light"
              >
                Login to the application
              </Link>
              <Link
                href="/docs"
                className="px-8 py-3 bg-transparent  border border-white/20 rounded-lg text-white hover:bg-[#44cc00]/20 transition-all duration-300 text-lg font-light"
              >
                Go to the Docs
              </Link>
            </div>
          </div>

          {/* Right side - Number 9 logo */}
          <div className="flex-shrink-0 ml-16">
            <div className="animate-float">
              <Image
                src="/images/Number 9.png"
                alt="Orchestra 9 Logo"
                width={400}
                height={400}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
