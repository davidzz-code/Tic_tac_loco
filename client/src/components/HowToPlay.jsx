import { useState } from 'react';

export default function HowToPlay({ setIsHowToPlayOpen }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      emoji: '🎯',
      title: 'Objetivo',
      text: 'El jugador que gane el tres en raya en el tablero grande ganará el juego.',
      imgSrc: ['/src/assets/how_to_play_1.png'],
    },
    {
      emoji: '📍',
      title: '¿Cómo ganar?',
      text: 'Cada casilla de tres en raya pequeño funciona igual que el juego original',
      imgSrc: ['/src/assets/how_to_play_2.png'],
    },
    {
      emoji: '📍',
      title: '¿Cómo ganar?',
      text: 'Cuando ganas un tres en raya pequeño, ese espacio en el tablero se bloquea con tu símbolo',
      imgSrc: ['/src/assets/how_to_play_3.png', '/src/assets/how_to_play_4.png'],
    },
    {
      emoji: '⚡',
      title: 'Regla especial - Turnos',
      text: 'Tu movimiento decide dónde jugará tu oponente en el siguiente turno',
      secondText: 'Al colocar tu símbolo en un espacio de un tres en raya pequeño, tu rival deberá jugar en el tres en raya que ocupa esa misma posición dentro del tablero grande.',
      imgSrc: ['/src/assets/how_to_play_5.png', '/src/assets/how_to_play_6.png'],
    },
    {
      emoji: '🎲',
      title: 'Juega donde quieras',
      text: 'Si tu oponente te envía a jugar en una casilla de tres en raya que ya ha sido ganada, puedes elegir cualquier casilla libre del tablero grande.',
      imgSrc: ['/src/assets/how_to_play_7.png', '/src/assets/how_to_play_8.png'],
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  function closeHowToPlay() {
    setIsHowToPlayOpen(false);
  }

  const hasTwoImages = slides[currentSlide].imgSrc.length === 2;
  // const modalWidth = hasTwoImages ? 'max-w-3xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-80 flex justify-center items-center z-50">
      <div className={`bg-[#242424] border-2 border-white p-6 rounded-lg mx-6 w-full max-w-xl`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold text-center">How to Play</h2>
          <button onClick={closeHowToPlay} className="text-md px-4 py-2 font-bold">X</button>
        </div>

        {/* Contenido */}
        <div className="flex flex-col items-center text-center">
          <div className="w-3/4">
            <p className="flex justify-center items-center gap-2 text-2xl mb-3">
              <span role="img" aria-label="objetivo">{slides[currentSlide].emoji}</span>
              <h2 className="font-semibold">{slides[currentSlide].title}</h2>
            </p>
            <p className='text-lg mb-4'>{slides[currentSlide].text}</p>
            <p className='text-lg'>{slides[currentSlide].secondText}</p>
          </div>
          {/* Mostrar imágenes */}
          {slides[currentSlide].imgSrc.length > 0 && (
            <div className={`flex ${hasTwoImages ? 'justify-center w-1/2' : 'w-1/2'} mt-4`}>
              {slides[currentSlide].imgSrc.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Instrucción visual ${index + 1}`}
                  className="w-full max-w-xs object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </div>

        {/* Controles de navegación */}
        <div className="flex justify-between mt-4">
          <button
            onClick={prevSlide}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
