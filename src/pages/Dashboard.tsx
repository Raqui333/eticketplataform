import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import CodeVerification from '@/components/CodeVerification';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (success: boolean) => {
    setIsLoggedIn(success);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md bg-white pt-5 rounded-lg">
              <div className="text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Painel de Controle
                </h1>
                <p className="text-gray-600/90">Festival de Verão 2025</p>
              </div>
              <LoginForm onLogin={handleLogin} />
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-600">
                  Painel de Verificação
                </h1>
                <p className="text-gray-600/90">
                  Verifique códigos de inscrição
                </p>
              </div>
              <Button
                onClick={handleLogout}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Sair
              </Button>
            </div>
            <CodeVerification />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
