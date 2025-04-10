// Elementos do DOM
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const nowPlaying = document.getElementById('now-playing');
const progress = document.getElementById('progress');
const filterBtn = document.getElementById('filter-btn');
const resetBtn = document.getElementById('reset-btn');
const playlistElement = document.getElementById('playlist');

// Playlists
const originalPlaylist = ['Bohemian Rhapsody', 'barulho', 'Space Oddity', 'barulho', 'Hey Jude', 'Superstition'];
let workingPlaylist = [...originalPlaylist];

// Controle do player
let currentTrackIndex = -1;
let isPlaying = false;
let isLoading = false;

// Mapeamento de músicas para arquivos
const musicFiles = {
    'Bohemian Rhapsody': './assets/Queen - Bohemian Rhapsody.mp3',
    'Space Oddity': './assets/David Bowie – Space Oddity.mp3',
    'Hey Jude': './assets/The Beatles - Hey Jude.mp3',
    'Superstition': './assets/Stevie Wonder Superstition.mp3'
};

// Inicialização
function initPlayer() {
    updatePlaylistDisplay();
    
    // Event listeners
    playBtn.addEventListener('click', togglePlay);
    stopBtn.addEventListener('click', stop);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    filterBtn.addEventListener('click', applyFilter);
    resetBtn.addEventListener('click', resetFilter);
    
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', nextTrack);
}

// Filtra a playlist (remove 'barulho')
function applyFilter() {
    workingPlaylist = originalPlaylist.filter(item => 
        item.trim().toLowerCase() !== 'barulho'
    );
    updatePlaylistDisplay();
    
    // Ajusta o track index se necessário
    if (currentTrackIndex >= workingPlaylist.length) {
        stop();
    }
}

// Retorna à playlist original
function resetFilter() {
    workingPlaylist = [...originalPlaylist];
    updatePlaylistDisplay();
    
    // Ajusta o track index se necessário
    if (currentTrackIndex >= workingPlaylist.length) {
        stop();
    }
}

// Atualiza a exibição da playlist
function updatePlaylistDisplay() {
    playlistElement.innerHTML = '';
    
    workingPlaylist.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.classList.add('playlist-item');
        
        if (index === currentTrackIndex && isPlaying) {
            trackElement.classList.add('playing');
        }
        
        trackElement.textContent = track;
        trackElement.addEventListener('click', () => playTrack(index));
        playlistElement.appendChild(trackElement);
    });
}

// Função para carregar e tocar a música
async function playTrack(index) {
    if (index < 0 || index >= workingPlaylist.length) return;
    
    try {
        // Para a reprodução atual antes de carregar nova música
        if (!audioPlayer.paused) {
            audioPlayer.pause();
        }
        
        currentTrackIndex = index;
        const trackName = workingPlaylist[index];
        const trackFile = musicFiles[trackName];
        
        if (!trackFile) {
            throw new Error(`Música não disponível: ${trackName}`);
        }

        // Estado de carregamento
        isLoading = true;
        nowPlaying.textContent = `Carregando: ${trackName}`;
        
        // Configura a fonte do áudio
        audioPlayer.src = trackFile;
        
        // Remove event listeners antigos para evitar múltiplas chamadas
        audioPlayer.removeEventListener('canplay', handleCanPlay);
        audioPlayer.removeEventListener('error', handlePlayError);
        
        // Adiciona novos listeners
        audioPlayer.addEventListener('canplay', handleCanPlay, { once: true });
        audioPlayer.addEventListener('error', handlePlayError, { once: true });
        
        // Inicia o carregamento
        await audioPlayer.load();
        
    } catch (error) {
        console.error("Erro ao carregar música:", error);
        nowPlaying.textContent = `Erro: ${error.message}`;
        isLoading = false;
    }
}

// Handler para quando o áudio estiver pronto
async function handleCanPlay() {
    try {
        // Espera um pequeno delay para evitar conflitos
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Tenta reproduzir
        await audioPlayer.play();
        
        // Atualiza a interface
        isPlaying = true;
        isLoading = false;
        const trackName = workingPlaylist[currentTrackIndex];
        nowPlaying.textContent = `Tocando agora: ${trackName}`;
        updatePlayBtnText();
        updatePlaylistDisplay();
        
    } catch (error) {
        console.error("Erro ao reproduzir:", error);
        nowPlaying.textContent = `Erro ao reproduzir: ${workingPlaylist[currentTrackIndex]}`;
        isLoading = false;
    }
}

// Handler para erros de reprodução
function handlePlayError() {
    console.error("Erro no elemento de áudio:", audioPlayer.error);
    nowPlaying.textContent = `Erro ao carregar: ${workingPlaylist[currentTrackIndex]}`;
    isLoading = false;
}

// Alterna entre play e pause
async function togglePlay() {
    if (workingPlaylist.length === 0 || isLoading) return;
    
    if (currentTrackIndex === -1) {
        await playTrack(0);
    } else if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        updatePlayBtnText();
    } else {
        try {
            await audioPlayer.play();
            isPlaying = true;
            updatePlayBtnText();
        } catch (error) {
            console.error("Erro ao retomar reprodução:", error);
        }
    }
}

// Para a reprodução
function stop() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    isPlaying = false;
    nowPlaying.textContent = 'Reprodução parada';
    updatePlayBtnText();
    updatePlaylistDisplay();
}

// Vai para a música anterior
function prevTrack() {
    if (workingPlaylist.length === 0) return;
    
    let newIndex = currentTrackIndex - 1;
    if (newIndex < 0) newIndex = workingPlaylist.length - 1;
    playTrack(newIndex);
}

// Vai para a próxima música
function nextTrack() {
    if (workingPlaylist.length === 0) return;
    
    let newIndex = currentTrackIndex + 1;
    if (newIndex >= workingPlaylist.length) newIndex = 0;
    playTrack(newIndex);
}

// Atualiza o texto do botão de play/pause
function updatePlayBtnText() {
    playBtn.textContent = isPlaying ? '⏸ Pausar' : '▶ Tocar';
}

// Atualiza a barra de progresso
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100 || 0;
    progress.style.width = `${progressPercent}%`;
}

// Inicializa o player
document.addEventListener('DOMContentLoaded', initPlayer);