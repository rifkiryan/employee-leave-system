"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircuitBackground } from "@/components/shared/CircuitBackground";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/validators/login-validator";
import { AuthStorageService } from "@/services/auth-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      // Simulate delay for UX and to showcase the running RGB loading state
      setTimeout(() => {
        if (res.ok && result.success) {
          AuthStorageService.setSession(result.user);
          toast.success("Access Granted. Initializing dashboard...");
          router.push("/dashboard");
        } else {
          toast.error(result.error || "Access Denied. Invalid security credentials.");
          setIsSubmitting(false);
        }
      }, 1000);
    } catch (err) {
      setTimeout(() => {
        toast.error("Network error. Unable to contact mainframe.");
        setIsSubmitting(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#070b19] overflow-hidden p-4">
      {/* Animated circuit lines background */}
      <CircuitBackground />

      {/* Futuristic neon glowing blurred spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* RGB Running Border Container */}
        <div className={`rgb-border-container transition-all duration-500 ${isSubmitting ? 'scale-[1.02] shadow-[0_0_50px_rgba(0,255,204,0.4)]' : 'shadow-[0_0_30px_rgba(9,9,20,0.8)]'}`}>
          <div className="rgb-border-content p-8">
            <div className="text-center space-y-4 pb-6">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-300/30">
                <CalendarDays className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 futuristic-glow-text tracking-wider uppercase">
                  Leave Portal
                </h1>
                <p className="text-cyan-400/60 text-xs font-mono tracking-widest mt-1">
                  SECURE CORE INTERFACE v1.0
                </p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-cyan-400/80 font-mono text-xs tracking-wider uppercase">
                        Operator Identity
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ENTER IDENTITY"
                          className="bg-slate-950/80 border-cyan-500/20 text-white placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 rounded-lg font-mono text-sm py-5 transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-rose-400 text-xs font-mono" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-400/80 font-mono text-xs tracking-wider uppercase">
                        Access Keypass
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="ENTER KEYPASS"
                          className="bg-slate-950/80 border-purple-500/20 text-white placeholder:text-slate-600 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 rounded-lg font-mono text-sm py-5 transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-rose-400 text-xs font-mono" />
                    </FormItem>
                  )}
                />

                {/* Submit button with animated glowing background */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-mono font-bold tracking-widest py-6 rounded-lg shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 active:scale-[0.98] border border-cyan-400/30"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-200" />
                      AUTHORIZING...
                    </span>
                  ) : (
                    "INITIALIZE DEPLOYMENT"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
