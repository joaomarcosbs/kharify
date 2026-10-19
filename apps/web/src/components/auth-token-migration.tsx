"use client"

import { useEffect } from "react"

/** Removes the JavaScript-readable token used by versions prior to cookie auth. */
export function AuthTokenMigration() {
  useEffect(() => {
    localStorage.removeItem("kharify_token")
  }, [])

  return null
}
