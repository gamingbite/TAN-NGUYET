import './styles.css';
import { gameEvents } from './game/config';
import type { FoundationScene } from './game/scenes/FoundationScene';
import type Phaser from 'phaser';

function element<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing application element: ${id}`);
  return node as T;
}

const stage = element('game');
const cover = element('stage-cover');
const startButton = element<HTMLButtonElement>('start-button');
const pauseButton = element<HTMLButtonElement>('pause-button');
const resetButton = element<HTMLButtonElement>('reset-button');
const pauseOverlay = element('pause-overlay');
const status = element('scene-status');
let game: Phaser.Game | undefined;
let isReady = false;
let isPaused = false;
let position = '';

function updateStatus(): void {
  status.textContent = isPaused ? 'Đã tạm dừng' : `Cảnh thử đang chạy · Vị trí ${position}`;
}

function scene(): FoundationScene | undefined {
  return game?.scene.getScene('foundation') as FoundationScene | undefined;
}

function togglePause(): void {
  if (!isReady) return;
  scene()?.clearInput();
  isPaused = !isPaused;
  if (isPaused) game?.scene.pause('foundation');
  else game?.scene.resume('foundation');
  pauseOverlay.hidden = !isPaused;
  pauseButton.textContent = isPaused ? 'Tiếp tục' : 'Tạm dừng';
  updateStatus();
  if (isPaused) element('resume-button').focus();
  else stage.focus({ preventScroll: true });
}

startButton.addEventListener('click', async () => {
  startButton.disabled = true;
  startButton.textContent = 'Đang mở cảnh thử…';
  try {
    const { createGame } = await import('./game/createGame');
    game = createGame(stage);
    game.events.on(gameEvents.position, (value: string) => { position = value; updateStatus(); });
    game.events.once(gameEvents.ready, () => {
      isReady = true;
      cover.hidden = true;
      pauseButton.disabled = false;
      resetButton.disabled = false;
      stage.dataset.ready = 'true';
      updateStatus();
      stage.focus({ preventScroll: true });
    });
  } catch (error) {
    const errorMessage = element('runtime-error');
    errorMessage.textContent = `Không thể mở cảnh thử: ${error instanceof Error ? error.message : String(error)}. Thử tải lại trang hoặc kiểm tra terminal.`;
    errorMessage.hidden = false;
    startButton.disabled = false;
    startButton.textContent = 'Thử mở lại cảnh';
    game?.destroy(true);
    game = undefined;
  }
});

pauseButton.addEventListener('click', togglePause);
element('resume-button').addEventListener('click', togglePause);
resetButton.addEventListener('click', () => {
  if (!isReady) return;
  scene()?.resetPlayer();
  if (isPaused) togglePause();
  stage.focus({ preventScroll: true });
});
window.addEventListener('keydown', (event) => {
  if (event.code === 'Escape' && !event.repeat) togglePause();
});
window.addEventListener('blur', () => { if (isReady && !isPaused) togglePause(); });
document.addEventListener('visibilitychange', () => {
  if (document.hidden && isReady && !isPaused) togglePause();
});

if (import.meta.hot) import.meta.hot.dispose(() => game?.destroy(true));
