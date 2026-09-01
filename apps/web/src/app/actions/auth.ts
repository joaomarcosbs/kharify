"use server"

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://api:3000" // Internally Docker can reach api:3000. Wait, docker-compose uses proxy, maybe we can reach http://api:3000 directly.

export async function loginAction(data: any) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.message || "E-mail ou senha inválidos." }
    }

    const result = await response.json()

    // Store token in HttpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set("kharify_token", result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    })

    return { success: true, user: result.user }
  } catch (error) {
    console.error("Erro no server action login:", error)
    return { success: false, error: "Erro interno de comunicação com a API." }
  }
}

export async function registerAction(data: any) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.message || "Erro ao realizar cadastro." }
    }

    const result = await response.json()

    // Store token in HttpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set("kharify_token", result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    })

    return { success: true, user: result.user }
  } catch (error) {
    console.error("Erro no server action register:", error)
    return { success: false, error: "Erro interno de comunicação com a API." }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("kharify_token")
  return { success: true }
}
