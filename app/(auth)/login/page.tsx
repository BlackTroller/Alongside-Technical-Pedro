import { login } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link"; // Importante para a navegação

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Entrar</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={login} className="space-y-4">
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
            <Input name="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </CardContent>

      {/* Secção de Signup adicionada aqui */}
      <CardFooter className="flex flex-col space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
          >
            Registe-se aqui
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
