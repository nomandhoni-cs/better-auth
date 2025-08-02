import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[#040404] text-white relative overflow-hidden">
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
      <div className="relative h-screen flex flex-col items-center justify-center px-4 pt-16">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </main>
  );
}
