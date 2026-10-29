"use server";

import { cookies } from "next/headers";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080/v1";

export async function loginAction(data: any) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || "E-mail ou senha inválidos." };
    }

    const result = await response.json();
    const token = result.data?.access_token || result.access_token;
    const user = result.data?.user || result.user;
    const organizationId = result.data?.organizationId || result.organizationId;

    if (!token) {
      return { success: false, error: "Token de autenticação não recebido da API." };
    }

    const cookieStore = await cookies();
    cookieStore.set("kharify_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return { success: true, user, organizationId };
  } catch (error) {
    console.error("Erro no server action login:", error);
    return { success: false, error: "Erro interno de comunicação com a API." };
  }
}

export async function registerAction(data: any) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Erro ao realizar cadastro." };
    }

    const result = await response.json();
    const token = result.data?.access_token || result.access_token;
    const user = result.data?.user || result.user;
    const organizationId = result.data?.organizationId || result.organizationId;

    if (!token) {
      return { success: false, error: "Token de autenticação não recebido da API." };
    }

    const cookieStore = await cookies();
    cookieStore.set("kharify_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return { success: true, user, organizationId };
  } catch (error) {
    console.error("Erro no server action register:", error);
    return { success: false, error: "Erro interno de comunicação com a API." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("kharify_token");
  return { success: true };
}

export async function googleLoginAction(idToken: string) {
  try {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Erro ao autenticar com o Google." };
    }

    const result = await response.json();
    const token = result.data?.access_token || result.access_token;
    const user = result.data?.user || result.user;
    const organizationId = result.data?.organizationId || result.organizationId;

    if (!token) {
      return { success: false, error: "Token de autenticação não recebido da API." };
    }

    const cookieStore = await cookies();
    cookieStore.set("kharify_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return { success: true, user, organizationId };
  } catch (error) {
    console.error("Erro no server action Google login:", error);
    return { success: false, error: "Erro interno de comunicação com a API." };
  }
}
