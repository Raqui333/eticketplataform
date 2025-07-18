import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Clock, Star } from 'lucide-react';

const ArtistSchedule = () => {
  const artists = [
    {
      day: '25',
      date: '25/07/2025',
      dayName: 'Sexta-feira',
      artist: 'DJ Alok',
      genre: 'Electronic Dance Music',
      time: '22:00',
      description:
        'Um dos DJs mais reconhecidos mundialmente, trazendo os melhores hits eletrônicos.',
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      day: '26',
      date: '26/07/2025',
      dayName: 'Sábado',
      artist: 'Anitta',
      genre: 'Pop/Funk',
      time: '21:30',
      description:
        'A rainha do pop brasileiro com seus sucessos que conquistaram o mundo.',
      image: '/placeholder.svg?height=200&width=200',
    },
    {
      day: '27',
      date: '27/07/2025',
      dayName: 'Domingo',
      artist: 'Gusttavo Lima',
      genre: 'Sertanejo',
      time: '20:00',
      description:
        'O embaixador do sertanejo brasileiro com seus grandes sucessos.',
      image: '/placeholder.svg?height=200&width=200',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <Card
            key={artist.day}
            className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm"
          >
            <div className="relative">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <Music className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-sm font-semibold text-purple-600">
                  {artist.dayName}
                </span>
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-purple-600" />
                <span className="text-sm font-semibold text-purple-600">
                  {artist.time}
                </span>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {artist.artist}
                </h3>
                <p className="text-sm text-purple-600 font-medium">
                  {artist.genre}
                </p>
                <p className="text-sm text-gray-500">{artist.date}</p>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {artist.description}
              </p>

              <div className="flex items-center justify-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ArtistSchedule;
