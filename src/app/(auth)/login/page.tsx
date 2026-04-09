"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Settings } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await login(formData);
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black p-4">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00f2fe]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#ff5500]/10 rounded-full blur-[100px]" />

      <div className="cyber-panel p-8 md:p-12 w-full max-w-md relative z-10 border border-[#00f2fe]/20 rounded-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center w-24 h-24 text-[#00f2fe] mb-4">
            <Settings className="w-full h-full absolute animate-[spin_10s_linear_infinite] opacity-60" />
            <span className="font-mono text-xl font-bold cyber-glow-cyan relative z-10">JLC</span>
          </div>
          <h1 className="text-2xl font-mono text-white text-center cyber-glow-cyan tracking-wider">
            SYSTEM_ACCESS
          </h1>
          <p className="text-[#00f2fe]/60 text-sm mt-2 font-mono">
            ENTER CREDENTIALS
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 relative">
            <label className="text-xs text-[#00f2fe]/70 font-mono tracking-widest uppercase">
              Operative_ID
            </label>
            <input
              type="email"
              name="email"
              placeholder="user@jlc.com"
              required
              className="cyber-input px-4 py-3 rounded-md font-mono text-sm"
            />
          </div>
          <div className="flex flex-col gap-2 relative">
            <label className="text-xs text-[#00f2fe]/70 font-mono tracking-widest uppercase">
              Pass_Key
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="cyber-input px-4 py-3 rounded-md font-mono text-sm tracking-widest"
            />
          </div>

          {state?.error && (
            <div className="bg-red-950/50 border border-red-500/50 text-red-400 p-3 rounded text-sm font-mono text-center">
              ACCESS_DENIED: {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="cyber-button py-3 mt-4 rounded-md font-bold text-sm"
          >
            {isPending ? "AUTHENTICATING..." : "INITIATE_LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
