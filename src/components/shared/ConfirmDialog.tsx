import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, LogOut, Trash2, CheckCircle2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  variant?: "default" | "destructive" | "logout" | "success";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-950 border border-cyan-500/30 text-white font-mono shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-xl sm:max-w-md overflow-hidden p-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 pointer-events-none" />
        
        <div className="p-6 relative z-10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-xl uppercase tracking-wider font-bold">
              {variant === "destructive" && <Trash2 className="h-5 w-5 text-rose-500" />}
              {variant === "logout" && <LogOut className="h-5 w-5 text-cyan-400" />}
              {variant === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
              {variant === "default" && <AlertTriangle className="h-5 w-5 text-amber-400" />}
              <span className={
                  variant === "destructive" ? "text-rose-400" :
                  variant === "logout" ? "text-cyan-400" :
                  variant === "success" ? "text-emerald-400" : "text-amber-400"
              }>{title}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 mt-4 text-sm leading-relaxed border-l-2 border-cyan-500/30 pl-4 py-2 bg-slate-900/50 rounded-r-md">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="relative z-10 mt-2 sm:space-x-4 bg-slate-900/80 p-4 border-t border-cyan-500/20 rounded-none sm:justify-end">
          <AlertDialogCancel className="bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white uppercase tracking-wider text-xs py-5 rounded-md transition-all duration-300 m-0">
            Abort
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`uppercase tracking-wider text-xs py-5 rounded-md transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] m-0 ${
              variant === "destructive"
                ? "bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                : variant === "logout"
                ? "bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : variant === "success"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "bg-amber-600 hover:bg-amber-500 text-white border border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            }`}
          >
            Confirm Execution
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
