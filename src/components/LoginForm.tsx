import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (success: boolean) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const resp = await fetch('/.netlify/functions/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login,
        password,
      }),
    });

    if (resp.ok) {
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao painel de controle.',
      });
      onLogin(true);
    } else {
      toast({
        title: 'Erro no login',
        description: 'Email ou senha incorretos.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="rounded-xl p-8 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-600 font-medium">
            Email
          </Label>
          <Input
            id="login"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Usuário"
            required
            className="border-gray-600/30 focus:border-purple-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-600 font-medium">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            className="border-gray-600/30 focus:border-purple-500"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
