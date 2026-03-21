import { configureBob } from "@aventure-studio/bob"
import { useStore } from "@/lib/store"
import { createAuthClient } from "@/lib/supabase-auth-client"

configureBob({
  toast: {
    loading: (msg) => {
      const state = useStore.getState()
      state.addToast({ type: "info", message: msg, duration: 30000 })
      // Read back the ID that the store generated
      const toasts = useStore.getState().toasts
      return toasts[toasts.length - 1]?.id ?? msg
    },
    success: (msg, opts) => {
      const state = useStore.getState()
      if (opts?.id) state.removeToast(String(opts.id))
      state.addToast({ type: "success", message: msg })
    },
    error: (msg, opts) => {
      const state = useStore.getState()
      if (opts?.id) state.removeToast(String(opts.id))
      state.addToast({ type: "error", message: msg })
    },
  },
  refreshSession: async () => {
    const supabase = createAuthClient()
    const { error } = await supabase.auth.refreshSession()
    if (error) {
      window.location.href = "/connexion"
      throw new Error("Session refresh failed")
    }
  },
})

export { withAutoFix } from "@aventure-studio/bob"
export type { FixEntry, BobConfig, AutoFixOptions } from "@aventure-studio/bob"
