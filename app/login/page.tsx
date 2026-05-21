"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Account created. Check your email if confirmation is enabled.");
  }

  async function signIn() {
  if (!email || !password) {
    alert("Please enter your email and password.");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = "/terminal";
}

  return (
    <main className="min-h-screen bg-[#070711] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8">
        <h1 className="text-3xl font-bold">HYBRID Login</h1>
        <p className="text-slate-400 mt-2">Access your trading terminal.</p>

        <input
          className="w-full mt-8 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mt-4 bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={signIn}
          className="w-full mt-6 bg-white text-black rounded-xl py-3 font-semibold"
        >
          Login
        </button>

        <button
          type="button"
          onClick={signUp}
          className="w-full mt-3 border border-white/20 rounded-xl py-3"
        >
          Create Account
        </button>
      </div>
    </main>
  );
}