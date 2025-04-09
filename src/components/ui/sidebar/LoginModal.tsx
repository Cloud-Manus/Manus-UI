import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "../alert-dialog";
import { Button } from "../button";
import { Separator } from "../separator";
import { useAuth } from "../../../lib/auth";
import { Github } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { login } = useAuth();

  const handleLogin = async (provider: "google" | "github") => {
    try {
      await login(provider);
      onClose();
    } catch (error) {
      console.error(`Failed to login with ${provider}:`, error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign In</AlertDialogTitle>
          <AlertDialogDescription>
            Sign in to save your settings and preferences.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Separator className="my-4" />

        <div className="flex flex-col gap-4 py-2">
          <Button
            className="flex items-center gap-2"
            onClick={() => handleLogin("google")}
            aria-label="Sign in with Google"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Sign in with Google
          </Button>

          <Button
            className="flex items-center gap-2"
            variant="outline"
            onClick={() => handleLogin("github")}
            aria-label="Sign in with GitHub"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            Sign in with GitHub
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel aria-label="Cancel">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 