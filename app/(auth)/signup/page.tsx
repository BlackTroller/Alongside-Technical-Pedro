import { signup } from "../actions"; // Importa a action de signup
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Criar Conta</CardTitle>
        <CardDescription className="text-center">
          Preencha os dados abaixo para se registar na plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Ligação à action de signup que criámos anteriormente */}
        <form action={signup} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome Completo</label>
            <Input
              name="name"
              type="text"
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              placeholder="teu@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              name="password"
              type="password"
              placeholder="Pelo menos 6 caracteres"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Criar conta
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
          >
            Faça login aqui
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
