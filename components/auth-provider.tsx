// components/auth-provider.tsx
"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type User = {
  id: string
  email: string
  fullName: string
  role: "admin" | "student"
  phoneNumber?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        try {
          const userRef = doc(db, "users", fbUser.uid)
          const userSnap = await getDoc(userRef)
          console.log("🔍 Firestore snapshot for", fbUser.uid, "→", userSnap.exists() ? userSnap.data() : "NOT FOUND")

          const data = userSnap.data()
          // determine role: Firestore first, then known-admin email, then student
          const firestoreRole = data?.role as "admin" | "student" | undefined
          const resolvedRole =
            firestoreRole
            ?? (fbUser.email === "admin@example.com" ? "admin" : "student")

          setUser({
            id: fbUser.uid,
            email: data?.email ?? fbUser.email ?? "",
            fullName: data?.fullName ?? fbUser.displayName ?? "",
            role: resolvedRole,
            phoneNumber: data?.phoneNumber ?? fbUser.phoneNumber ?? undefined,
          })
        } catch (err) {
          console.error("❌ Error loading profile for", fbUser.uid, err)
          setUser({
            id: fbUser.uid,
            email: fbUser.email ?? "",
            fullName: fbUser.displayName ?? "",
            role: fbUser.email === "admin@example.com" ? "admin" : "student",
            phoneNumber: fbUser.phoneNumber ?? undefined,
          })
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return true
    } catch (err) {
      console.error("⚠️ Login failed:", err)
      return false
    }
  }

  const logout = async () => {
    await auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
