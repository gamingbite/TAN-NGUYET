import './ui/demo.css';
import { DemoUI, type DemoUIActions } from './ui/DemoUI';
import { SoundFeedback, type SoundCue } from './game/audio/SoundFeedback';
import { RECIPES } from './game/model/catalog';
import {
  acceptQuest, buyItem, changeClass, completeQuest, craftItem, createNewState,
  equipItem, learnClass, learnRecipe, respawn, sellItem, usePotion,
} from './game/model/state';
import { getSaveBackupKeys, hasSave, importGame, loadGame, parseSave, SAVE_KEY, saveGame } from './game/model/storage';
import { loadSettings, saveSettings } from './game/model/settings';
import type { ActionResult, CharacterAppearance, GameSession, GameState, WorldObject } from './game/model/types';
import type { DemoScene } from './game/scenes/DemoScene';
import type Phaser from 'phaser';

const root = document.getElementById('app');
if (!root) throw new Error('Không tìm thấy vùng hiển thị game.');
const sound = new SoundFeedback();
let settings = loadSettings();
sound.configure(settings);
let game: Phaser.Game | undefined;
let session: GameSession | undefined;
let stage: HTMLElement | undefined;
let starting = false;
let ready = false;
let autosaveAllowed = false;
let classChangedAt = -Infinity;
const itemIconURLs = new WeakMap<HTMLCanvasElement, string>();

function scene(): DemoScene | undefined {
  return game?.scene.getScene('world') as DemoScene | undefined;
}

const fail = (message: string): ActionResult => ({ ok: false, message });

function refresh(): void {
  if (!session) return;
  ui.render(session.state, session.inCombat);
  if (!stage) return;
  const state = session.state;
  stage.dataset.zone = state.world.zone;
  stage.dataset.px = String(Math.round(state.world.x));
  stage.dataset.py = String(Math.round(state.world.y));
  stage.dataset.paused = String(session.paused);
  stage.dataset.combat = String(session.inCombat);
  stage.dataset.ore = String(state.progress.oreMined);
  stage.dataset.sealKills = String(state.progress.sealKills);
  stage.dataset.sealResolved = String(state.progress.sealResolved);
  stage.dataset.bossDefeated = String(state.progress.bossDefeated);
  stage.dataset.completed = String(state.progress.demoCompleted);
  if (ready) {
    const art = scene()?.getArtStatus();
    if (art) {
      stage.dataset.artWorldFrames = String(art.worldFrames);
      stage.dataset.artPlayerFrames = String(art.playerFrames);
      stage.dataset.artMissing = String(art.missing);
      stage.dataset.artWarnings = String(art.warnings);
    }
    const status = scene()?.getCombatStatus();
    if (status) ui.setCombatStatus(status);
    ui.setQuestGuidance(scene()?.getQuestGuidanceStatus() ?? null);
    sound.setAmbience(state.world.zone);
    const boss = scene()?.getBossStatus();
    stage.dataset.bossPhase = String(boss?.phase ?? 0);
    stage.dataset.bossHp = String(boss?.hp ?? 0);
    stage.dataset.bossWarning = String(boss?.warning ?? false);
  }
}

function pause(): void {
  if (!session || !ready) return;
  scene()?.clearInput();
  session.paused = true;
  game?.scene.pause('world');
  refresh();
}

function resume(): void {
  if (!session || !ready) return;
  scene()?.clearInput();
  session.paused = false;
  game?.scene.resume('world');
  refresh();
  stage?.focus({ preventScroll: true });
}

function requireNpc(role: WorldObject['role']): ActionResult | null {
  if (!session || !ready) return fail('Chưa có phiên chơi.');
  if (session.inCombat) return fail('Không thể thực hiện khi đang giao tranh.');
  if (!scene()?.nearbyNpc(role)) return fail('Hãy đứng cạnh đúng NPC để thực hiện thao tác này.');
  return null;
}

function action(operation: () => ActionResult, cue?: SoundCue): ActionResult {
  if (!session || !ready) return fail('Chưa có phiên chơi.');
  const result = operation();
  if (result.ok && cue) sound.play(cue);
  refresh();
  return result;
}

function save(): ActionResult {
  if (!session || !ready) return fail('Chưa có phiên chơi để lưu.');
  if (session.state.hp <= 0) return fail('Chờ hồi sinh trước khi lưu tiến độ.');
  // A save stores persistent progress, not transient enemy/projectile state.
  if (session.inCombat) return fail('Hãy thoát giao tranh trước khi lưu để có điểm tiếp tục an toàn.');
  const result = saveGame(session.state);
  if (result.ok) autosaveAllowed = true;
  return result;
}

function downloadSave(raw: string, label = 'save'): ActionResult {
  try {
    const file = new Blob([raw], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url; link.download = `tan-nguyet-${label}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { ok: true, message: 'Đã xuất bản lưu hiện có thành file JSON trên máy.' };
  } catch { return fail('Trình duyệt không cho xuất bản lưu.'); }
}

async function begin(state: GameState, continuing = false): Promise<void> {
  if (starting) return;
  starting = true;
  ready = false;
  autosaveAllowed = continuing;
  sound.unlock();
  if (state.hp <= 0) respawn(state);
  try {
    const { createDemoGame } = await import('./game/createDemoGame');
    game?.destroy(true);
    session = {
      state, inCombat: false, paused: false,
      notify: (message, tone) => ui.toast(message, tone), changed: refresh,
    };
    classChangedAt = -Infinity;
    stage = ui.mountGame(state);
    stage.dataset.ready = 'false';
    game = createDemoGame(stage, session, {
      ready: () => {
        ready = true;
        scene()?.setSettings(settings);
        stage!.dataset.ready = 'true';
        stage!.focus({ preventScroll: true });
        refresh();
      },
      nearby: (text, progress) => ui.setInteraction(text, progress),
      interaction: (object) => { if (object.role && session) ui.openNPC(object.role, session.state); },
      potion: (id) => { const result = actions.usePotion(id); ui.toast(result.message, result.ok ? 'success' : 'info'); },
      panel: (panel) => {
        if (!session) return;
        if (panel === 'pause') ui.showPause(session.state);
        else ui.showPanel(panel, session.state);
      },
    }, sound);
    scene()?.setSettings(settings);
    if (state.progress.demoCompleted) ui.toast('Chào mừng trở lại! Bạn có thể tiếp tục tự do khám phá.');
  } catch (error) {
    game?.destroy(true); game = undefined; session = undefined; stage = undefined;
    ui.mountTitle(hasSave(), `Không mở được game: ${error instanceof Error ? error.message : String(error)}`);
  } finally { starting = false; }
}

const actions: DemoUIActions = {
  create: (appearance: CharacterAppearance) => { void begin(createNewState(appearance)); },
  continue: () => {
    const loaded = loadGame();
    if (!loaded.state) { ui.toast(loaded.error ?? 'Chưa có bản lưu để tiếp tục.', 'danger'); return; }
    void begin(loaded.state, true);
  },
  pause, resume, save,
  returnToTitle: () => {
    const result = save();
    if (!result.ok) { ui.toast(result.message, 'danger'); return; }
    game?.destroy(true);
    sound.stopAmbience();
    game = undefined; session = undefined; stage = undefined; ready = false;
    ui.mountTitle(true);
  },
  travel: () => {
    if (!session || !ready) return fail('Chưa có phiên chơi.');
    if (!session.state.world.travelUnlocked) return fail('Lần đầu cần tự đi tới bia dịch chuyển trong rừng.');
    if (session.inCombat || session.state.world.zone === 'dungeon') return fail('Dịch chuyển chỉ dùng ngoài giao tranh ở thị trấn hoặc rừng.');
    const destination = session.state.world.zone === 'town' ? 'forest' : 'town';
    scene()?.enterZone(destination, destination === 'town' ? 480 : 180, destination === 'town' ? 400 : 320);
    sound.play('magic');
    refresh();
    return { ok: true, message: 'Đã dịch chuyển tới điểm đã mở.' };
  },
  usePotion: (id) => action(() => usePotion(session!.state, id), 'pickup'),
  switchClass: (id) => {
    if (!session || !ready) return fail('Chưa có phiên chơi.');
    if (session.state.world.elapsedSeconds - classChangedAt < 3) return fail('Đổi Class đang hồi chiêu 3 giây.');
    return action(() => {
      const result = changeClass(session!.state, id, session!.inCombat);
      if (result.ok) classChangedAt = session!.state.world.elapsedSeconds;
      return result;
    }, 'quest');
  },
  craft: (id) => {
    const recipe = RECIPES[id];
    if (!recipe) return fail('Công thức không tồn tại.');
    const blocked = requireNpc(recipe.station);
    return blocked ?? action(() => craftItem(session!.state, id), 'craft');
  },
  learnRecipe: (id) => {
    const recipe = RECIPES[id];
    if (!recipe) return fail('Công thức không tồn tại.');
    const blocked = requireNpc(recipe.station);
    return blocked ?? action(() => learnRecipe(session!.state, id), 'quest');
  },
  equip: (id) => action(() => equipItem(session!.state, id), 'pickup'),
  buy: (id) => requireNpc('merchant') ?? action(() => buyItem(session!.state, id), 'pickup'),
  sell: (id) => requireNpc('merchant') ?? action(() => sellItem(session!.state, id), 'pickup'),
  quest: (id) => {
    const blocked = requireNpc('elder');
    if (blocked) return blocked;
    return action(() => {
      const result = session!.state.quests[id] === 'locked' ? acceptQuest(session!.state, id) : completeQuest(session!.state, id);
      if (result.ok && session!.state.progress.demoCompleted && id === 'boss') ui.showEnding(session!.state);
      return result;
    }, 'quest');
  },
  learnClass: (id) => requireNpc('trainer') ?? action(() => learnClass(session!.state, id), 'quest'),
  getSettings: () => ({ ...settings }),
  getItemIcon: (id) => {
    const key = `item-${id}`;
    if (!game?.textures.exists(key)) return undefined;
    const source = game.textures.get(key).getSourceImage();
    if (!(source instanceof HTMLCanvasElement)) return undefined;
    let url = itemIconURLs.get(source);
    if (!url) { url = source.toDataURL('image/png'); itemIconURLs.set(source, url); }
    return url;
  },
  updateSettings: (patch) => {
    const next = { ...settings, ...patch };
    const result = saveSettings(next);
    if (result.ok) { settings = next; sound.configure(settings); scene()?.setSettings(settings); }
    return result;
  },
  exportSave: () => {
    try {
      // Export the existing raw save even when damaged so the player can keep
      // a copy before an explicit restore. Unsaved sessions must save first.
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return fail('Chưa có bản lưu. Hãy lưu tiến độ trước khi xuất file.');
      return downloadSave(raw);
    } catch { return fail('Trình duyệt không cho đọc hoặc xuất bản lưu.'); }
  },
  listSaveBackups: () => {
    try {
      return getSaveBackupKeys().flatMap(key => {
        const raw = localStorage.getItem(key);
        return raw === null ? [] : [{ key, raw }];
      });
    } catch { return []; }
  },
  exportBackup: (key) => {
    try {
      if (!getSaveBackupKeys().includes(key)) return fail('Không tìm thấy bản sao đã chọn.');
      const raw = localStorage.getItem(key);
      return raw === null ? fail('Không tìm thấy dữ liệu bản sao.') : downloadSave(raw, 'backup');
    } catch { return fail('Trình duyệt không cho đọc bản sao.'); }
  },
  importSave: (raw) => {
    if (starting) return fail('Chờ mở phiên chơi xong trước khi khôi phục.');
    if (session?.inCombat || (session && session.state.hp <= 0)) return fail('Hãy thoát giao tranh và hồi sinh trước khi khôi phục bản lưu.');
    const parsed = parseSave(raw);
    if (!parsed.state) return fail(parsed.error ?? 'File không chứa bản lưu hợp lệ.');
    const result = importGame(raw);
    if (result.ok) void begin(parsed.state, true);
    return result;
  },
  fullscreen: async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await root.requestFullscreen();
      return { ok: true, message: document.fullscreenElement ? 'Đã mở toàn màn hình.' : 'Đã trở về cửa sổ.' };
    } catch { return fail('Trình duyệt này chưa cho phép mở toàn màn hình.'); }
  },
};

const ui = new DemoUI(root, actions);
const initialSave = loadGame();
ui.mountTitle(hasSave(), initialSave.error ?? undefined);

window.addEventListener('keydown', event => {
  if (event.code === 'Escape' && !event.repeat && ui.hasPanel) {
    event.preventDefault(); ui.closePanel();
  }
});
window.addEventListener('blur', () => {
  if (session && ready && !session.paused) ui.showPause(session.state);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && session && ready && !session.paused) ui.showPause(session.state);
});
window.addEventListener('beforeunload', event => {
  if (!session || !autosaveAllowed) return;
  // Preserve the player's current browser save whenever it can be safely written.
  const result = session.inCombat ? fail('Đang giao tranh') : save();
  if (!result.ok) { event.preventDefault(); event.returnValue = ''; }
});
if (import.meta.hot) import.meta.hot.dispose(() => { game?.destroy(true); sound.dispose(); });
