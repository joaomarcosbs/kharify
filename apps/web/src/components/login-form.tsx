"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { loginAction, googleLoginAction } from "@/app/actions/auth"
import { useOrganizationStore } from "@/stores/organization-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { GoogleLogin } from "@react-oauth/google"

// Rendered at build/server time — safe to read here to drive conditional JSX
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

const schema = z.object({
  email: z.email("Insira um e-mail válido."),
  password: z.string().min(1, "A senha é obrigatória."),
})

type FormValues = z.infer<typeof schema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const processForm = async (data: FormValues) => {
    try {
      const response = await loginAction(data)
      if (response.success) {
        if (response.organizationId) {
          useOrganizationStore.getState().setActiveOrganization({
            id: response.organizationId,
            name: "Organização Principal",
            type: "pessoal",
          })
        }
        window.location.href = "/home"
      } else {
        toast.error(response.error ?? "E-mail ou senha inválidos.")
      }
    } catch (error: unknown) {
      console.error("Erro no login:", error)
      toast.error("Erro ao realizar login.")
    }
  }

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential
    if (!idToken) {
      toast.error("Credencial Google inválida.")
      return
    }
    const response = await googleLoginAction(idToken)
    if (response.success) {
      if (response.organizationId) {
        useOrganizationStore.getState().setActiveOrganization({
          id: response.organizationId,
          name: "Organização Principal",
          type: "pessoal",
        })
      }
      window.location.href = "/home"
    } else {
      toast.error(response.error ?? "Erro ao autenticar com o Google.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(processForm)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <a
                  href="/home"
                  className="flex flex-col items-center gap-2 font-medium mb-6"
                >
                  <span className="text-xl font-bold">Kharify</span>
                </a>
                <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                <p className="text-balance text-muted-foreground">
                  Faça login na sua conta Kharify
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exemplo.com"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <FieldError errors={[errors.email]} />}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    onClick={(e) => {
                      e.preventDefault()
                      toast.info("Recuperação de senha em breve 🚧")
                    }}
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <FieldError errors={[errors.password]} />}
              </Field>

              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </Field>

              {/* Google login — only shown when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set */}
              {GOOGLE_CLIENT_ID && (
                <>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Ou continue com
                  </FieldSeparator>
                  <Field className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => { toast.error("Falha ao autenticar com o Google.") }}
                      text="signin_with"
                      shape="rectangular"
                    />
                  </Field>
                </>
              )}

              <FieldDescription className="text-center">
                Ainda não tem uma conta? <a href="/register">Registre-se</a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="text-center text-xs text-muted-foreground">
        Ao clicar em entrar, você concorda com nossos <br />
        <a href="#">Termos de Serviço</a> e <a href="#">Política de Privacidade</a>.
      </FieldDescription>
    </div>
  )
}
