import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "../alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../tabs";
import { Button } from "../button";
import { Input } from "../input";
import { Separator } from "../separator";
import { useAuth } from "../../../lib/auth";
import { useState } from "react";
import { UserSettings } from "../../../types/auth";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings: currentSettings, updateSettings, logout } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({ ...currentSettings });
  const [showLLMApiKey, setShowLLMApiKey] = useState(false);
  const [showVisionApiKey, setShowVisionApiKey] = useState(false);
  const [showTavilyApiKey, setShowTavilyApiKey] = useState(false);
  const [showVisionSettings, setShowVisionSettings] = useState(false);

  const handleChange = (
    section: "llm" | "vision",
    field: "modelName" | "baseUrl" | "apiKey",
    value: string
  ) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  const handleSearchProviderChange = (provider: UserSettings["searchProvider"]) => {
    setSettings({
      ...settings,
      searchProvider: provider,
    });
  };

  const handleTavilyApiKeyChange = (value: string) => {
    setSettings({
      ...settings,
      tavilyApiKey: value,
    });
  };

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      onClose();
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleCopyFromLLM = () => {
    setSettings({
      ...settings,
      vision: {
        ...settings.vision,
        baseUrl: settings.llm.baseUrl,
        apiKey: settings.llm.apiKey,
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Settings</AlertDialogTitle>
        </AlertDialogHeader>

        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="search">Search Provider</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Language Model</h3>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="llm-model" className="text-sm font-medium">Model Name</label>
                  <Input
                    id="llm-model"
                    value={settings.llm.modelName}
                    onChange={(e) => handleChange("llm", "modelName", e.target.value)}
                    placeholder="gpt-4-turbo"
                    aria-label="LLM Model Name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="llm-url" className="text-sm font-medium">Base URL</label>
                  <Input
                    id="llm-url"
                    value={settings.llm.baseUrl}
                    onChange={(e) => handleChange("llm", "baseUrl", e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    aria-label="LLM Base URL"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="llm-key" className="text-sm font-medium">API Key</label>
                <div className="relative">
                  <Input
                    id="llm-key"
                    type={showLLMApiKey ? "text" : "password"}
                    value={settings.llm.apiKey}
                    onChange={(e) => handleChange("llm", "apiKey", e.target.value)}
                    placeholder="sk-..."
                    aria-label="LLM API Key"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowLLMApiKey(!showLLMApiKey)}
                    aria-label={showLLMApiKey ? "Hide API Key" : "Show API Key"}
                  >
                    {showLLMApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Vision Model</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="h-8 flex items-center gap-1"
                  onClick={() => setShowVisionSettings(!showVisionSettings)}
                  aria-label="Toggle Vision Settings"
                  aria-expanded={showVisionSettings}
                >
                  {showVisionSettings ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span>{showVisionSettings ? "Hide" : "Show"}</span>
                </Button>
              </div>
              <Separator />

              {showVisionSettings && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="vision-model" className="text-sm font-medium">Model Name</label>
                      <Input
                        id="vision-model"
                        value={settings.vision.modelName}
                        onChange={(e) =>
                          handleChange("vision", "modelName", e.target.value)
                        }
                        placeholder="gpt-4-vision"
                        aria-label="Vision Model Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="vision-url" className="text-sm font-medium">Base URL</label>
                      <Input
                        id="vision-url"
                        value={settings.vision.baseUrl}
                        onChange={(e) =>
                          handleChange("vision", "baseUrl", e.target.value)
                        }
                        placeholder="https://api.openai.com/v1"
                        aria-label="Vision Base URL"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="vision-key" className="text-sm font-medium">API Key</label>
                    <div className="relative">
                      <Input
                        id="vision-key"
                        type={showVisionApiKey ? "text" : "password"}
                        value={settings.vision.apiKey}
                        onChange={(e) =>
                          handleChange("vision", "apiKey", e.target.value)
                        }
                        placeholder="sk-..."
                        aria-label="Vision API Key"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        onClick={() => setShowVisionApiKey(!showVisionApiKey)}
                        aria-label={
                          showVisionApiKey ? "Hide API Key" : "Show API Key"
                        }
                      >
                        {showVisionApiKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={handleCopyFromLLM}
                      aria-label="Copy from Language Model"
                    >
                      Copy from Language Model
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-6 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Search Provider</h3>
              <Separator />
              <div className="grid grid-cols-2 gap-2">
                {["tavily", "google", "duckduckgo", "bing"].map((provider) => (
                  <Button
                    key={provider}
                    variant={
                      settings.searchProvider === provider ? "default" : "outline"
                    }
                    onClick={() =>
                      handleSearchProviderChange(
                        provider as UserSettings["searchProvider"]
                      )
                    }
                    className="capitalize"
                    aria-label={`Select ${provider} as search provider`}
                    aria-pressed={settings.searchProvider === provider}
                  >
                    {provider}
                  </Button>
                ))}
              </div>

              {settings.searchProvider === "tavily" && (
                <div className="space-y-2 pt-4">
                  <label htmlFor="tavily-key" className="text-sm font-medium">Tavily API Key</label>
                  <div className="relative">
                    <Input
                      id="tavily-key"
                      type={showTavilyApiKey ? "text" : "password"}
                      value={settings.tavilyApiKey || ""}
                      onChange={(e) => handleTavilyApiKeyChange(e.target.value)}
                      placeholder="tvly-..."
                      aria-label="Tavily API Key"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowTavilyApiKey(!showTavilyApiKey)}
                      aria-label={
                        showTavilyApiKey ? "Hide API Key" : "Show API Key"
                      }
                    >
                      {showTavilyApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <AlertDialogFooter className="flex justify-between items-center">
          <Button 
            variant="destructive" 
            onClick={logout}
            aria-label="Sign Out"
          >
            Sign Out
          </Button>
          <div className="flex gap-2">
            <AlertDialogCancel aria-label="Cancel">Cancel</AlertDialogCancel>
            <Button 
              onClick={handleSave}
              aria-label="Save Settings"
            >
              Save Settings
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 