import { createRoot } from 'react-dom/client'
import { VimeoPlaylist } from './components/VimeoPlaylist'
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import './index.css'

createRoot(document.getElementById("root")!).render(
  <TooltipProvider>
    <VimeoPlaylist />
    <Toaster />
  </TooltipProvider>
);