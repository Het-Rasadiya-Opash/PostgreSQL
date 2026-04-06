export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 text-slate-300">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
