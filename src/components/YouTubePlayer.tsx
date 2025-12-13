import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, X, Play, Monitor, Layout, Youtube } from 'lucide-react';
import { Video } from '../data/videoLibrary';

interface YouTubePlayerProps {
  playlist: Video[];
  autoPlay?: boolean;
}

type ViewMode = 'mini' | 'normal' | 'theater';

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ playlist, autoPlay = false }) => {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(playlist[0] || null);
  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  const [isVisible, setIsVisible] = useState(true);

  // Atualiza o vídeo se a playlist mudar (ex: usuário clicou em "Ver Vídeo" na lista)
  useEffect(() => {
    if (playlist.length > 0) {
      setCurrentVideo(playlist[0]);
      setIsVisible(true);
    }
  }, [playlist]);

  if (!currentVideo || !isVisible) return null;

  // Classes de layout baseadas no modo de visualização
  const containerClasses = {
    mini: "fixed bottom-24 right-4 w-72 z-50 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden animate-slide-up",
    normal: "w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-gray-200 dark:border-zinc-800",
    theater: "fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-fade-in",
  };

  return (
    <>
      {/* Container Principal */}
      <div className={containerClasses[viewMode]}>
        
        {/* Header do Player (Apenas Theater e Mini para controle) */}
        {viewMode !== 'normal' && (
          <div className={`flex justify-between items-center p-3 ${viewMode === 'theater' ? 'w-full max-w-4xl' : ''} bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10`}>
             <div className="flex items-center gap-2 text-white">
                <Youtube size={18} className="text-red-600" fill="currentColor" />
                <span className="text-xs font-bold truncate max-w-[150px]">{currentVideo.title}</span>
             </div>
             <div className="flex gap-2">
                {viewMode === 'mini' && (
                    <button onClick={() => setViewMode('normal')} className="text-white hover:text-emerald-400">
                        <Maximize2 size={16} />
                    </button>
                )}
                {viewMode === 'theater' && (
                    <button onClick={() => setViewMode('normal')} className="text-white hover:text-emerald-400">
                        <Minimize2 size={20} />
                    </button>
                )}
                <button onClick={() => setIsVisible(false)} className="text-white hover:text-red-500">
                    <X size={18} />
                </button>
             </div>
          </div>
        )}

        {/* 
            ÁREA DO IFRAME - IMPLEMENTAÇÃO ESTRITA SEM API 
            Usa apenas o embed oficial conforme solicitado.
        */}
        <div className={`relative ${viewMode === 'theater' ? 'w-full max-w-5xl aspect-video' : 'aspect-video w-full'}`}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`}
            title={currentVideo.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full object-cover bg-black"
            style={{ borderRadius: viewMode === 'mini' ? '0px' : '0px' }} // Tailwind cuida do border-radius externo
          />
        </div>

        {/* Controles e Playlist (Apenas Normal e Theater) */}
        {viewMode !== 'mini' && (
          <div className={`bg-white dark:bg-zinc-900 p-4 ${viewMode === 'theater' ? 'w-full max-w-5xl rounded-b-2xl' : ''}`}>
            
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">{currentVideo.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                        <Youtube size={14} className="text-red-600" />
                        Vídeo Demonstrativo
                    </p>
                </div>
                
                {/* Botões de Modo de Visualização */}
                <div className="flex gap-2 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setViewMode('mini')}
                        className="p-2 rounded-md hover:bg-white dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400 transition-all"
                        title="Mini Player"
                    >
                        <Layout size={18} />
                    </button>
                    <button 
                        onClick={() => setViewMode('theater')}
                        className="p-2 rounded-md hover:bg-white dark:hover:bg-zinc-700 text-gray-500 dark:text-zinc-400 transition-all"
                        title="Modo Cinema"
                    >
                        <Monitor size={18} />
                    </button>
                </div>
            </div>

            {/* Playlist Horizontal - Mostra os vídeos do treino atual */}
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Exercícios deste Treino</p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {playlist.map((video) => (
                        <button
                            key={video.id}
                            onClick={() => setCurrentVideo(video)}
                            className={`flex-shrink-0 w-32 group text-left ${currentVideo.id === video.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                        >
                            <div className="aspect-video rounded-lg overflow-hidden relative mb-2 border border-transparent group-hover:border-emerald-500 transition-all bg-gray-100 dark:bg-zinc-800">
                                {/* Thumbnail gerada automaticamente pelo YouTube (sem API) */}
                                <img 
                                    src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} 
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                                {currentVideo.id === video.id && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white animate-pulse">
                                            <Play size={14} fill="currentColor" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className={`text-xs font-bold line-clamp-2 ${currentVideo.id === video.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                {video.title}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default YouTubePlayer;
