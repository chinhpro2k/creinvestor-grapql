import { useAuth } from "./AuthProvider"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { Box, CircularProgress } from "@mui/material"

export function AuthGuard({ children }: { children: JSX.Element }) {
  const { user, initializing, setRedirect } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initializing) {
      //auth is initialized and there is no user
      if (!user) {
        // remember the page that user tried to access
        setRedirect(router.route)
        router.push("/")
      }
    }
  }, [initializing, router, user, setRedirect])

  /* show loading indicator while the auth provider is still initializing */
  if (initializing) {
    return <Box sx={{ position: 'relative' }} style={{left: '48%', top: '40%', position: 'absolute'}}>
      <CircularProgress/></Box>
  }

  // if auth initialized with a valid user show protected page
  if (!initializing && user) {
    return <>{children}</>
  }

  /* otherwise don't return anything, will do a redirect from useEffect */
  return null
}
