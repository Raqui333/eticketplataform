import EventRegistrationForm from '@/components/EventRegistrationForm';
import ArtistSchedule from '@/components/ArtistSchedule';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
            Festival de Verão 2025
          </h1>
          <p className="text-xl md:text-2xl mb-6 opacity-90">
            25, 26 e 27 de Julho • 3 Dias de Música Inesquecível
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-lg">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
              Mais de 10 artistas
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
              3 palcos simultâneos
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
              Praça de alimentação
            </div>
          </div>
        </div>
      </div>

      {/* Registration Section */}
      <div className="py-8 md:py-10 relative">
        <EventRegistrationForm />
      </div>

      {/* Artists Schedule Section */}
      <div className="py-2 md:py-2 relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Lineup dos Artistas
            </h2>
            <p className="text-gray-600">
              Conheça os artistas que irão se apresentar em cada dia
            </p>
          </div>

          <ArtistSchedule />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 Festival de Verão. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Suporte: contato@festivaldeverao.com.br | (11) 99999-9999
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
