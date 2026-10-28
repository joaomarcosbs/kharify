"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { registerAction, googleLoginAction } from "@/app/actions/auth"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ORGANIZATION_TYPES } from "@/types/enums"
import type { OrganizationType } from "@/types/enums"
import { isValidDocument } from "@/lib/validators"
import { GoogleLogin } from "@react-oauth/google"

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

const schema = z.object({
  name: z.string().min(1, "O nome completo é obrigatório."),
  email: z.email("Insira um e-mail válido."),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
  organizationName: z.string().min(1, "O nome da organização é obrigatório."),
  organizationType: z.custom<OrganizationType>(
    (val) => ["pessoal", "empresarial"].includes(val as string),
    { message: "Selecione um tipo." }
  ),
  document: z.string()
    .min(1, "O documento é obrigatório para emissão de notas fiscais.")
    .refine((val) => isValidDocument(val), "Documento inválido. Insira um CPF ou CNPJ válido.")
})

type FormValues = z.infer<typeof schema>

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      organizationName: "",
      organizationType: "pessoal",
      document: "",
    },
  })

  const processForm = async (data: FormValues) => {
    try {
      const response = await registerAction(data)
      if (response.success) {
        if (response.organizationId) {
          useOrganizationStore.getState().setActiveOrganization({
            id: response.organizationId,
            name: data.organizationName || "Organização Principal",
            type: data.organizationType || "pessoal",
          })
        }
        window.location.href = "/home"
      } else {
        toast.error(response.error ?? "Erro ao realizar cadastro.")
      }
    } catch (error: unknown) {
      console.error("Erro no cadastro:", error)
      toast.error("Erro ao realizar cadastro.")
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
                <h1 className="text-2xl font-bold">Crie sua conta</h1>
                <p className="text-balance text-muted-foreground">
                  Preencha os dados abaixo para se cadastrar
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <FieldError errors={[errors.name]} />}
              </Field>

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
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <FieldError errors={[errors.password]} />}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="organizationName">Nome da Organização</FieldLabel>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="Minha Empresa"
                    {...register("organizationName")}
                    aria-invalid={!!errors.organizationName}
                  />
                  {errors.organizationName && <FieldError errors={[errors.organizationName]} />}
                </Field>

                <Field>
                  <FieldLabel htmlFor="organizationType">Tipo</FieldLabel>
                  <Controller
                    control={control}
                    name="organizationType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="organizationType" aria-invalid={!!errors.organizationType}>
                          <SelectValue>
                            {field.value
                              ? ORGANIZATION_TYPES[field.value as OrganizationType]
                              : "Selecione..."}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ORGANIZATION_TYPES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.organizationType && <FieldError errors={[errors.organizationType]} />}
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="document">CPF/CNPJ</FieldLabel>
                <Input
                  id="document"
                  type="text"
                  placeholder="Apenas números ou alfanumérico"
                  {...register("document")}
                  aria-invalid={!!errors.document}
                />
                {errors.document && <FieldError errors={[errors.document]} />}
              </Field>

              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar
                </Button>
              </Field>

              {/* Google signup — only shown when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set */}
              {GOOGLE_CLIENT_ID && (
                <>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Ou cadastre-se com
                  </FieldSeparator>
                  <Field className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => { toast.error("Falha ao autenticar com o Google.") }}
                      text="signup_with"
                      shape="rectangular"
                    />
                  </Field>
                </>
              )}

              <FieldDescription className="text-center">
                Já tem uma conta? <a href="/login">Faça login</a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="text-center text-xs text-muted-foreground">
        Ao clicar em cadastrar, você concorda com nossos <br />
        <a href="#">Termos de Serviço</a> e <a href="#">Política de Privacidade</a>.
      </FieldDescription>
    </div>
  )
}
