import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome completo é obrigatório'),
  cpf: z
    .string()
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      'CPF deve estar no formato 000.000.000-00'
    ),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .regex(
      /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      'Telefone deve estar no formato (00) 00000-0000'
    ),
  dataEvento: z.enum(['2025-07-25', '2025-07-26', '2025-07-27'], {
    required_error: 'Selecione um dia do evento',
  }),
});

type FormData = z.infer<typeof formSchema>;

const EventRegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [vagasDisponiveis, setVagasDisponiveis] = useState({
    '2025-07-25': 500,
    '2025-07-26': 500,
    '2025-07-27': 500,
  });

  const fetchVagas = async () => {
    const resp = await fetch('/.netlify/functions/fetchSpots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: localStorage.getItem('db') || '[]',
    });

    const vagas = await resp.json();
    setVagasDisponiveis(vagas);
  };

  useEffect(() => {
    fetchVagas();
    const interval = setInterval(fetchVagas, 30000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 11) {
      const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    } else if (cleaned.length === 10) {
      const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
    return value;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    let error_msg = 'Tente novamente em alguns instantes.';

    try {
      const db = JSON.parse(localStorage.getItem('db') || '[]');

      const resp = await fetch('/.netlify/functions/addEntry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry: data, db }),
      });

      if (!resp.ok) {
        const response_data = await resp.json();
        if (response_data.error) {
          error_msg = response_data.error;
          throw new Error(response_data.error);
        }
      }

      const rdata = await resp.json();

      data.codehex = rdata.codehex;
      db.push(data);

      localStorage.setItem('db', JSON.stringify(db));

      const response = await fetch('/.netlify/functions/sendTicket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          name: data.nomeCompleto,
          date: data.dataEvento,
          code: rdata.codehex,
          used: false,
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'eticket.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Inscrição realizada com sucesso!',
        description: `Seu ticket para o dia ${new Date(
          data.dataEvento + 'T00:00:00-03:00'
        ).toLocaleDateString('pt-BR')} foi enviado no seu email.`,
      });

      reset();

      fetchVagas();
    } catch (error) {
      toast({
        title: 'Erro ao processar inscrição',
        description: error_msg,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDateLabel = (date: string) => {
    const dateObj = new Date(date + 'T00:00:00');
    const dayNames = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ];
    const dayName = dayNames[dateObj.getDay()];
    const formattedDate = dateObj.toLocaleDateString('pt-BR');
    return `${dayName}, ${formattedDate}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Faça sua Inscrição
            </h2>
          </CardTitle>
          <p className="text-gray-600 text-md">
            Reserve sua vaga para o maior evento do ano!
          </p>
        </CardHeader>

        <CardContent className="p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8 text-gray-600"
          >
            <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-3">
              {/* Nome Completo */}
              <div className="space-y-3">
                <Label
                  htmlFor="nomeCompleto"
                  className="text-gray-600 font-semibold text-sm"
                >
                  Nome Completo *
                </Label>
                <Input
                  id="nomeCompleto"
                  {...register('nomeCompleto')}
                  placeholder="Digite seu nome completo"
                  className=" border-gray-300 rounded-lg focus:border-purple-500"
                />
                {errors.nomeCompleto && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.nomeCompleto.message}
                  </p>
                )}
              </div>

              {/* CPF */}
              <div className="space-y-3">
                <Label
                  htmlFor="cpf"
                  className="text-gray-600 font-semibold text-sm"
                >
                  CPF *
                </Label>
                <Input
                  id="cpf"
                  {...register('cpf')}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="  border-gray-300 focus:border-purple-500 text-sm"
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value);
                    e.target.value = formatted;
                    setValue('cpf', formatted);
                  }}
                />
                {errors.cpf && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.cpf.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-gray-600 font-semibold text-sm"
                >
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="seuemail@exemplo.com"
                  className="  border-gray-300 focus:border-purple-500 text-sm"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-3">
                <Label
                  htmlFor="telefone"
                  className="text-gray-600 font-semibold text-sm"
                >
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  {...register('telefone')}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="border-gray-300 focus:border-purple-500 text-sm"
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    e.target.value = formatted;
                    setValue('telefone', formatted);
                  }}
                />
                {errors.telefone && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.telefone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Seleção de Data */}
            <div className="space-y-5">
              <Label className="text-gray-600 font-semibold text-sm">
                Escolha o dia do evento *
              </Label>
              <RadioGroup
                onValueChange={(value) => setValue('dataEvento', value as any)}
                className="space-y-4"
              >
                {Object.entries(vagasDisponiveis).map(([date, vagas]) => (
                  <div
                    key={date}
                    className={
                      vagas <= 0
                        ? 'flex items-center space-x-4 p-2 opacity-50 pointer-events-none select-none border-2 rounded-lg'
                        : 'flex items-center space-x-4 p-2 hover:bg-purple-500/10 transition-all duration-300 border-2 hover:border-purple-500 rounded-md'
                    }
                  >
                    <RadioGroupItem
                      disabled={vagas <= 0 ? true : false}
                      value={date}
                      id={date}
                      className="border-gray-600 w-5 h-5"
                    />
                    <Label htmlFor={date} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">
                          {getDateLabel(date)}
                        </span>
                        <span className="text-sm text-center text-gray-600 bg-purple-500/20 px-3 py-1 rounded-full">
                          {vagas} vagas disponíveis
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.dataEvento && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.dataEvento.message}
                </p>
              )}
            </div>

            {/* Botão de Envio */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? 'Processando...' : 'Confirmar Inscrição'}
            </Button>
          </form>
          <div className="text-center my-2">
            (Nesse DEMO o pdf será baixado para o seu dispositivo) <br />
            Você pode válidar o ticket no{' '}
            <a href="/painel" className="text-blue-500 hover:underline">
              PAINEL
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventRegistrationForm;
