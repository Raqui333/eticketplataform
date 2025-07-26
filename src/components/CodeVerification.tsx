import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QrCode } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const CodeVerification = () => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
    participantInfo?: {
      nomeCompleto: string;
      email: string;
      dataEvento: string;
    };
  } | null>(null);
  const { toast } = useToast();

  const html5QrcodeScannerRef = useRef<Html5Qrcode | null>(null);

  const handleVerifyCode = async (customCode?: string) => {
    const codeToUse = (customCode ?? code).trim();

    if (!codeToUse.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, digite um código para verificar.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);

    try {
      const db = JSON.parse(localStorage.getItem('db') || '[]');

      const resp = await fetch('/.netlify/functions/verifyCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToUse.toLocaleLowerCase(),
          db, // Use localStorage for demo purposes
        }),
      });

      if (!resp.ok) {
        setVerificationResult({
          isValid: false,
          message: 'Código inválido ou não encontrado.',
        });

        toast({
          title: 'Código inválido',
          description: 'Este código não foi encontrado no sistema.',
          variant: 'destructive',
        });

        return;
      }

      const participantInfo = await resp.json();

      if (participantInfo.used === true) {
        setVerificationResult({
          isValid: false,
          message: 'Código já utilizado.',
          participantInfo,
        });
        toast({
          title: 'Código inválido',
          description: 'Este código já foi utilizado.',
          variant: 'destructive',
        });

        return;
      }

      setVerificationResult({
        isValid: true,
        message: 'Código válido! Participante confirmado.',
        participantInfo,
      });
      toast({
        title: 'Código válido!',
        description: `Participante: ${participantInfo.nomeCompleto}`,
      });

      db.find((info) => info.codehex === codeToUse).used = true;
      localStorage.setItem('db', JSON.stringify(db));
    } catch (err) {
      toast({
        title: 'Erro ao processar inscrição',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setCode('');
    setVerificationResult(null);
  };

  const stopScan = (scanner: Html5Qrcode) => {
    scanner.stop().then(() => {
      scanner.clear();
    });
  };

  useEffect(() => {
    html5QrcodeScannerRef.current = new Html5Qrcode('reader');
    return () => {
      const scanner = html5QrcodeScannerRef.current;
      if (scanner.isScanning) stopScan(scanner);
    };
  }, []);

  const handleQRCodeScan = () => {
    resetVerification();

    const scanner = html5QrcodeScannerRef.current;

    if (!scanner) return;

    if (scanner.isScanning) {
      stopScan(scanner);
      return;
    }

    try {
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 250 },
        (code) => {
          handleVerifyCode(code);
          stopScan(scanner);
        },
        (error) => {
          console.error('Erro ao scannear QRCode', error);
        }
      );
    } catch (err) {
      console.error('Erro ao iniciar o scanner:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="w-500" id="reader"></div>
      {/* Formulário de verificação */}
      <div className="rounded-xl p-8 shadow-xl bg-white">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Verificar Código de Inscrição
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-gray-600 font-medium">
              Código de Verificação
            </Label>
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Digite o código (ex: 1a2b-3c4d-5e6f)"
              className="border-gray-300 focus:border-purple-500 text-lg"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => handleVerifyCode(code)}
              disabled={isVerifying}
              className="w-full h-10 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isVerifying ? 'Verificando...' : 'Verificar Código'}
            </Button>

            <Button
              onClick={handleQRCodeScan}
              variant="outline"
              className="px-4 border-purple-500 hover:bg-purple-200"
            >
              <QrCode className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resultado da verificação */}
      {verificationResult && (
        <div
          className={`bg-white rounded-xl p-6 shadow-xl ${
            verificationResult.isValid
              ? 'border-l-4 border-green-500'
              : 'border-l-4 border-red-500'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3
                className={`text-xl font-bold mb-2 ${
                  verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {verificationResult.isValid
                  ? '✅ Código Válido'
                  : '❌ Código Inválido'}
              </h3>

              <p className="text-cinza-pedra mb-4">
                {verificationResult.message}
              </p>
            </div>

            <Button
              onClick={resetVerification}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-600/80"
            >
              Nova Verificação
            </Button>
          </div>
          <div>
            {verificationResult.participantInfo && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 w-full">
                <h4
                  className={`font-semibold ${verificationResult.isValid ? 'text-green-700' : 'text-red-700'}`}
                >
                  Informações do Participante:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="font-medium">Nome:</span>{' '}
                    {verificationResult.participantInfo.nomeCompleto}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{' '}
                    {verificationResult.participantInfo.email}
                  </p>
                  <p>
                    <span className="font-medium">Dia do evento:</span>{' '}
                    {verificationResult.participantInfo.dataEvento}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeVerification;
