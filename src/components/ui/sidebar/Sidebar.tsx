import { UserCircle, Settings } from "lucide-react";
import { useAuth } from "../../../lib/auth";
import { Avatar } from "./Avatar";
import { Button } from "../button";
import { useState } from "react";
import { LoginModal } from "./LoginModal";
import { SettingsModal } from "./SettingsModal";

export const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <div className="h-full w-14 bg-secondary flex flex-col items-center justify-between py-4">
      <div className="flex flex-col items-center gap-2">
        {/* Top icons can go here if needed */}
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => isAuthenticated ? setShowSettingsModal(true) : setShowLoginModal(true)}
            aria-label={isAuthenticated ? "User settings" : "Log in"}
          >
            {isAuthenticated && user?.avatarUrl ? (
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                className="h-10 w-10"
              />
            ) : (
              <UserCircle className="h-6 w-6" />
            )}
          </Button>
          
          {isAuthenticated && !user?.avatarUrl && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-secondary" />
          )}
        </div>

        {isAuthenticated && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => setShowSettingsModal(true)}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}; 