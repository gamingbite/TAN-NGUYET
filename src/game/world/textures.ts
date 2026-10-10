import type Phaser from 'phaser';
import type { CharacterAppearance, ClassId } from '../model/types';
import { createRasterPlayerTexture } from './PlayerArt';
import type { PlayerAnimationPose } from './PlayerAnimation';

// All art is drawn locally from integer pixel shapes. No downloaded assets,
// random terrain or network requests are required to reproduce the demo.
type Graphics = Phaser.GameObjects.Graphics;
type Paint = (graphics: Graphics) => void;
export type ActorDirection = 'down' | 'up' | 'left' | 'right';
export type PlayerPose = PlayerAnimationPose;
type ActorPose = PlayerPose | 'blink';

const rect = (g: Graphics, color: number, x: number, y: number, width: number, height: number, alpha = 1): void => {
  g.fillStyle(color, alpha).fillRect(x, y, width, height);
};
const shadow = (g: Graphics, x: number, y: number, width: number, height: number): void => {
  rect(g, 0x071414, x + 2, y, width - 4, height, .5);
  rect(g, 0x071414, x, y + 2, width, Math.max(2, height - 4), .5);
};
const colorValue = (value: string, fallback: number): number => /^#[0-9a-f]{6}$/i.test(value)
  ? Number.parseInt(value.slice(1), 16) : fallback;
const shade = (color: number, factor: number): number => {
  const component = (shift: number): number => Math.min(255, Math.max(0, Math.round(((color >> shift) & 255) * factor)));
  return (component(16) << 16) | (component(8) << 8) | component(0);
};

function makeTexture(scene: Phaser.Scene, key: string, width: number, height: number, paint: Paint): void {
  if (scene.textures.exists(key)) return;
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  paint(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

function paintTree(g: Graphics): void {
  shadow(g, 5, 55, 39, 8);
  rect(g, 0x2e2926, 20, 31, 10, 28);
  rect(g, 0x715039, 21, 34, 7, 24);
  rect(g, 0x99704a, 22, 36, 2, 21);
  rect(g, 0x392f27, 24, 46, 3, 7);
  rect(g, 0x715039, 16, 57, 6, 3);
  rect(g, 0x715039, 28, 57, 6, 3);
  const layers = [[17, 0, 17, 9], [9, 7, 29, 13], [3, 18, 41, 17], [0, 30, 48, 13], [6, 40, 37, 8]];
  for (const [x, y, w, h] of layers) rect(g, 0x142f29, x, y, w, h);
  rect(g, 0x315641, 16, 2, 17, 9);
  rect(g, 0x3b6648, 10, 9, 25, 13);
  rect(g, 0x2e543d, 5, 20, 35, 12);
  rect(g, 0x274a36, 3, 32, 39, 11);
  rect(g, 0x203e30, 10, 42, 29, 4);
  for (const [x, y, w] of [[19, 5, 8], [13, 12, 10], [28, 16, 6], [7, 23, 10], [20, 26, 8], [32, 29, 6], [11, 35, 7]]) {
    rect(g, 0x5a8051, x, y, w, 2);
    rect(g, 0x78945c, x, y, 3, 1);
  }
  rect(g, 0x182f28, 12, 28, 4, 3);
  rect(g, 0x182f28, 28, 35, 6, 3);
}

function paintHouse(g: Graphics): void {
  shadow(g, 3, 85, 106, 10);
  rect(g, 0x242d2b, 7, 32, 98, 57);
  rect(g, 0x454a3b, 9, 38, 94, 45);
  rect(g, 0xa79a72, 14, 41, 84, 37);
  rect(g, 0xc2ae81, 17, 45, 77, 28);
  rect(g, 0x5b4f39, 10, 77, 92, 10);
  rect(g, 0x968263, 12, 78, 88, 4);
  rect(g, 0x644837, 11, 42, 5, 36);
  rect(g, 0x644837, 97, 42, 4, 35);
  rect(g, 0x705039, 15, 51, 82, 3);
  rect(g, 0x271f22, 38, 3, 38, 8);
  rect(g, 0x271f22, 23, 9, 65, 10);
  rect(g, 0x271f22, 12, 17, 88, 12);
  rect(g, 0x271f22, 3, 27, 106, 17);
  rect(g, 0x695340, 39, 5, 35, 7);
  rect(g, 0x806447, 25, 11, 60, 10);
  rect(g, 0x91714c, 14, 19, 84, 11);
  rect(g, 0x9e7e53, 6, 29, 99, 11);
  rect(g, 0xc0a36d, 5, 40, 103, 3);
  for (let row = 0; row < 4; row++) {
    const y = 12 + row * 8;
    const left = 27 - row * 7;
    const right = 84 + row * 7;
    rect(g, 0x4c4031, left, y + 6, right - left, 1);
    for (let x = left + 4 + (row % 2) * 6; x < right; x += 12) {
      rect(g, 0xb09562, x, y, 2, 6);
      rect(g, 0x6c573d, x + 2, y + 4, 8, 1);
    }
  }
  rect(g, 0x373633, 77, 2, 11, 20);
  rect(g, 0x8c8272, 79, 3, 7, 17);
  rect(g, 0x444842, 78, 1, 11, 4);
  rect(g, 0x403c30, 43, 59, 26, 27);
  rect(g, 0x71553b, 47, 61, 18, 24);
  rect(g, 0x97754e, 49, 63, 4, 21);
  rect(g, 0x473b2e, 56, 63, 2, 22);
  rect(g, 0xe1be69, 61, 73, 2, 2);
  rect(g, 0x777767, 42, 86, 28, 5);
  rect(g, 0xa6a18c, 44, 86, 24, 2);
  for (const x of [23, 76]) {
    rect(g, 0x594938, x - 2, 57, 17, 18);
    rect(g, 0xe0bf73, x, 59, 13, 12);
    rect(g, 0xf4d999, x + 2, 59, 4, 10);
    rect(g, 0x69513a, x + 6, 59, 2, 12);
    rect(g, 0x69513a, x, 64, 13, 2);
    rect(g, 0x4f4638, x - 3, 73, 19, 3);
  }
  rect(g, 0x62754b, 21, 75, 16, 4);
  rect(g, 0xb08672, 24, 74, 3, 3);
  rect(g, 0xb9ac71, 31, 74, 3, 3);
}

function paintRock(g: Graphics): void {
  shadow(g, 2, 20, 32, 6);
  rect(g, 0x2c3736, 5, 6, 23, 17);
  rect(g, 0x2c3736, 1, 12, 33, 10);
  rect(g, 0x64706a, 8, 4, 17, 6);
  rect(g, 0x53625c, 4, 10, 26, 9);
  rect(g, 0x7d8580, 9, 7, 13, 3);
  rect(g, 0x46544e, 7, 18, 24, 4);
  rect(g, 0x3b4946, 18, 11, 3, 11);
  rect(g, 0x8a8f80, 7, 11, 6, 2);
  rect(g, 0x344c38, 1, 19, 7, 4);
}

function paintBush(g: Graphics): void {
  shadow(g, 1, 18, 28, 5);
  rect(g, 0x19392d, 3, 8, 24, 13);
  rect(g, 0x244b34, 0, 11, 30, 8);
  rect(g, 0x345f3c, 6, 4, 17, 12);
  rect(g, 0x496e44, 7, 6, 8, 3);
  rect(g, 0x416c40, 20, 10, 7, 3);
  rect(g, 0x83745b, 8, 14, 3, 3);
  rect(g, 0x9d8563, 22, 15, 2, 2);
}

function paintPillar(g: Graphics): void {
  shadow(g, 0, 36, 30, 6);
  rect(g, 0x252f36, 5, 5, 20, 33);
  rect(g, 0x40515b, 8, 7, 14, 29);
  rect(g, 0x667982, 9, 8, 4, 26);
  rect(g, 0x2f3c46, 17, 9, 4, 27);
  rect(g, 0x526770, 3, 2, 24, 6);
  rect(g, 0x7c8c8c, 4, 2, 22, 2);
  rect(g, 0x536772, 3, 35, 24, 5);
  rect(g, 0x86918a, 5, 35, 20, 2);
  rect(g, 0x2f414a, 13, 16, 3, 10);
  rect(g, 0x7fb8be, 13, 18, 3, 5);
  rect(g, 0x385d62, 9, 25, 8, 2);
}

function paintTorch(g: Graphics, blue = false): void {
  rect(g, 0x213030, 5, 18, 9, 14);
  rect(g, 0x6b5840, 7, 18, 5, 13);
  rect(g, 0xae8651, 8, 19, 2, 10);
  rect(g, 0x8b7753, 3, 17, 13, 3);
  rect(g, blue ? 0x365f78 : 0x6b3e32, 3, 7, 12, 10, .6);
  rect(g, blue ? 0x397896 : 0xb05b35, 5, 3, 8, 15);
  rect(g, blue ? 0x59bad0 : 0xe89945, 7, 0, 4, 16);
  rect(g, blue ? 0xafebe4 : 0xf6cf75, 6, 9, 6, 8);
  rect(g, blue ? 0xe0fff0 : 0xffedb0, 8, 11, 2, 6);
}

function paintFlower(g: Graphics): void {
  rect(g, 0x3d6349, 8, 7, 2, 9);
  rect(g, 0x68874f, 4, 11, 5, 2);
  rect(g, 0x425d42, 10, 13, 4, 2);
  rect(g, 0xbdac74, 6, 3, 6, 6);
  rect(g, 0xe2c98e, 4, 5, 10, 2);
  rect(g, 0x725e39, 8, 5, 2, 2);
  rect(g, 0xa286a9, 0, 13, 4, 3);
}

function paintFence(g: Graphics): void {
  shadow(g, 0, 18, 48, 5);
  rect(g, 0x443b2d, 1, 4, 5, 16);
  rect(g, 0x443b2d, 40, 4, 5, 16);
  rect(g, 0x82654b, 0, 2, 6, 18);
  rect(g, 0x82654b, 39, 2, 6, 18);
  rect(g, 0xb09364, 1, 2, 2, 17);
  rect(g, 0xb09364, 40, 2, 2, 17);
  rect(g, 0x443c30, 3, 7, 40, 5);
  rect(g, 0x80694c, 3, 6, 39, 3);
  rect(g, 0xa3875e, 5, 6, 35, 1);
  rect(g, 0x70563e, 4, 14, 36, 3);
}

function paintOre(g: Graphics): void {
  shadow(g, 2, 22, 30, 5);
  rect(g, 0x273a3b, 2, 11, 30, 13);
  rect(g, 0x475a59, 4, 8, 26, 13);
  rect(g, 0x607171, 8, 5, 16, 13);
  rect(g, 0x88958a, 10, 4, 10, 5);
  rect(g, 0x344746, 22, 10, 7, 11);
  rect(g, 0x314744, 6, 19, 22, 4);
  rect(g, 0x98c4b2, 11, 8, 4, 7);
  rect(g, 0x618f87, 8, 13, 4, 6);
  rect(g, 0xa9d4c2, 18, 10, 3, 5);
  rect(g, 0x6b9f93, 21, 15, 4, 5);
  rect(g, 0xd1e1c5, 12, 8, 2, 2);
  rect(g, 0x7fa77b, 2, 20, 4, 3);
}

function paintHerb(g: Graphics): void {
  shadow(g, 0, 21, 20, 3);
  rect(g, 0x254a3b, 8, 9, 3, 13);
  rect(g, 0x5f8c56, 2, 12, 7, 4);
  rect(g, 0x789c64, 0, 10, 6, 3);
  rect(g, 0x5b7f56, 11, 15, 7, 3);
  rect(g, 0x466e4a, 13, 13, 6, 3);
  rect(g, 0x717cb0, 5, 2, 9, 7);
  rect(g, 0xc6bbdb, 8, 1, 4, 9);
  rect(g, 0xa69aca, 4, 4, 13, 3);
  rect(g, 0xe5dbc5, 8, 5, 3, 2);
}

function paintSeal(g: Graphics): void {
  shadow(g, 6, 35, 52, 11);
  rect(g, 0x34434a, 8, 29, 48, 13);
  rect(g, 0x53636a, 12, 25, 40, 12);
  rect(g, 0x787e88, 16, 23, 32, 9);
  rect(g, 0x283638, 18, 28, 28, 4);
  rect(g, 0x81659e, 17, 21, 30, 3);
  rect(g, 0x573f74, 23, 3, 18, 23);
  rect(g, 0x9c7dbd, 25, 1, 14, 22);
  rect(g, 0x705195, 20, 8, 24, 12);
  rect(g, 0x251d40, 26, 6, 12, 14);
  rect(g, 0xbc9bdb, 28, 5, 8, 3);
  rect(g, 0xbc9bdb, 26, 8, 3, 7);
  rect(g, 0xbc9bdb, 35, 8, 3, 7);
  rect(g, 0xbc9bdb, 28, 15, 8, 3);
  rect(g, 0xe2cbbf, 30, 10, 4, 5);
  for (const [x, y] of [[14, 24], [46, 24], [9, 30], [53, 30], [18, 37], [42, 37]]) {
    rect(g, 0xbb9de0, x, y, 3, 3);
    rect(g, 0xebe0dd, x + 1, y, 1, 1);
  }
  rect(g, 0x9c7dbd, 2, 15, 2, 2, .65);
  rect(g, 0x9c7dbd, 57, 8, 2, 2, .65);
}

function paintTravel(g: Graphics): void {
  shadow(g, 3, 47, 30, 7);
  rect(g, 0x35464b, 3, 44, 30, 8);
  rect(g, 0x82938b, 7, 44, 22, 3);
  rect(g, 0x283d43, 9, 8, 18, 36);
  rect(g, 0x4e7272, 11, 8, 14, 34);
  rect(g, 0x80a6a0, 12, 8, 3, 32);
  rect(g, 0x94ada4, 11, 4, 14, 5);
  rect(g, 0x496369, 9, 7, 18, 3);
  rect(g, 0xbbaa79, 10, 36, 16, 3);
  rect(g, 0x263f49, 15, 14, 6, 18);
  rect(g, 0x66b9bc, 17, 15, 2, 15);
  rect(g, 0xa0e1d7, 14, 20, 8, 3);
  rect(g, 0xd9f0c8, 16, 20, 4, 2);
  rect(g, 0x7a9da1, 4, 33, 2, 2);
  rect(g, 0x7a9da1, 29, 21, 2, 2);
}

function paintSecret(g: Graphics): void {
  shadow(g, 1, 17, 30, 4);
  rect(g, 0x34413d, 2, 8, 28, 10);
  rect(g, 0x607066, 5, 4, 23, 12);
  rect(g, 0x7b8473, 8, 3, 17, 3);
  rect(g, 0x4b5d4e, 3, 12, 7, 6);
  rect(g, 0x2d4439, 23, 14, 9, 4);
  rect(g, 0x344841, 13, 7, 2, 7);
  rect(g, 0x819882, 15, 7, 6, 2);
  rect(g, 0x819882, 19, 9, 2, 4);
  rect(g, 0x819882, 15, 12, 6, 2);
}

function paintSlime(g: Graphics, pose: ActorPose = 'idle'): void {
  shadow(g, 1, 19, 26, 5);
  if (pose !== 'idle') {
    const rising = pose === 'walk1';
    const attacking = pose === 'attack';
    const top = rising ? 3 : attacking ? 5 : 8;
    rect(g, 0x183c37, 2, top + 5, 24, 20 - top - 5);
    rect(g, 0x183c37, 7, top, 14, 20 - top);
    rect(g, 0x3f8b64, 4, top + 5, 20, 14 - top);
    rect(g, 0x68a471, 8, top + 1, 11, 17 - top);
    rect(g, 0x91c788, 8, top + 3, 6, 3);
    rect(g, 0x2c6d59, 4, 17, 20, 2);
    const eyeY = top + 7;
    rect(g, 0x142e31, 9, eyeY, 3, attacking ? 2 : 3);
    rect(g, 0x142e31, 18, eyeY, 3, attacking ? 2 : 3);
    rect(g, 0xe2e2b1, 10, eyeY, 1, 1);
    rect(g, 0xe2e2b1, 19, eyeY, 1, 1);
    if (attacking) rect(g, 0x142e31, 12, eyeY + 4, 6, 2);
    rect(g, 0xb5d88d, 12, top - 2, 4, 3);
    rect(g, 0x618959, 2, 20, 7, 2);
    return;
  }
  rect(g, 0x183c37, 2, 10, 24, 10);
  rect(g, 0x183c37, 7, 5, 14, 15);
  rect(g, 0x3f8b64, 4, 10, 20, 9);
  rect(g, 0x68a471, 8, 6, 11, 11);
  rect(g, 0x91c788, 8, 8, 6, 3);
  rect(g, 0x2c6d59, 4, 16, 20, 3);
  rect(g, 0x142e31, 9, 13, 3, 3);
  rect(g, 0x142e31, 18, 13, 3, 3);
  rect(g, 0xe2e2b1, 10, 13, 1, 1);
  rect(g, 0xe2e2b1, 19, 13, 1, 1);
  rect(g, 0xb5d88d, 12, 3, 4, 3);
  rect(g, 0x618959, 2, 20, 7, 2);
}

function paintWolf(g: Graphics, pose: ActorPose = 'idle'): void {
  shadow(g, 0, 23, 32, 4);
  rect(g, 0x26383b, 3, 9, 25, 12);
  rect(g, 0x687b80, 5, 8, 20, 12);
  rect(g, 0x3b5057, 1, 7, 7, 12);
  rect(g, 0x879594, 7, 7, 14, 7);
  const stride = pose === 'walk1' ? 2 : pose === 'walk2' ? -2 : 0;
  rect(g, 0x34474d, 6 + stride, 19, 5, 7);
  rect(g, 0x34474d, 21 - stride, 19, 5, 7);
  rect(g, 0xa3aba2, 6 + stride, 25, 6, 2);
  rect(g, 0xa3aba2, 21 - stride, 25, 6, 2);
  rect(g, 0x293d43, 15, 5, 17, 14);
  rect(g, 0x778e92, 17, 5, 12, 12);
  rect(g, 0x778e92, 15, 0, 4, 10);
  rect(g, 0x778e92, 26, 1, 4, 9);
  rect(g, 0x344d54, 16, 2, 2, 5);
  rect(g, 0x344d54, 27, 3, 2, 4);
  rect(g, 0xb6beb0, 20, 12, 12, 6);
  rect(g, 0x202f34, 29, 11, 3, 4);
  rect(g, 0xdfaf70, 22, 8, 3, 2);
  rect(g, 0xffddb0, 23, 8, 1, 1);
  if (pose === 'attack') {
    rect(g, 0x172431, 21, 16, 11, 4);
    rect(g, 0xe3d7b5, 22, 16, 2, 3); rect(g, 0xe3d7b5, 28, 16, 2, 3);
  }
}

function paintWraith(g: Graphics, pose: ActorPose = 'idle'): void {
  shadow(g, 2, 32, 24, 4);
  rect(g, 0x302844, 7, 4, 15, 19);
  rect(g, 0x55476c, 4, 16, 21, 15);
  rect(g, 0x796589, 8, 3, 13, 20);
  rect(g, 0x534163, 7, 19, 15, 11);
  rect(g, 0x3d344f, 2, 23, 7, 9);
  rect(g, 0x3d344f, 21, 23, 6, 9);
  rect(g, 0x796589, 7, 29, 5, 5);
  rect(g, 0x796589, 17, 29, 5, 5);
  rect(g, 0x1b2530, 9, 9, 10, 9);
  rect(g, 0xabddd0, 10, 11, 3, 2);
  rect(g, 0xabddd0, 16, 11, 3, 2);
  rect(g, 0xe3f1dc, 11, 11, 1, 1);
  rect(g, 0xe3f1dc, 17, 11, 1, 1);
  rect(g, 0xa48fb1, 10, 4, 7, 2);
  rect(g, 0x897294, 12, 21, 3, 8);
  rect(g, 0x719a9d, 0, 17, 2, 4, .7);
  rect(g, 0x719a9d, 26, 8, 2, 2, .7);
  if (pose === 'walk1' || pose === 'walk2') {
    const left = pose === 'walk1';
    rect(g, 0x302844, left ? 7 : 17, 28, 5, 5);
    rect(g, 0x9b85b2, left ? 17 : 7, 30, 4, 4);
    rect(g, 0x6fc4cf, left ? 2 : 24, 19, 2, 3, .75);
  } else if (pose === 'attack') {
    rect(g, 0x5d4a79, 0, 17, 8, 5); rect(g, 0x5d4a79, 20, 17, 8, 5);
    rect(g, 0xabcdda, 0, 18, 3, 3); rect(g, 0xabcdda, 25, 18, 3, 3);
    rect(g, 0xe3f1dc, 11, 11, 1, 2); rect(g, 0xe3f1dc, 17, 11, 1, 2);
  }
}

function paintBoss(g: Graphics, pose: ActorPose = 'idle', phase: 1 | 2 = 1): void {
  shadow(g, 4, 48, 40, 7);
  rect(g, 0x201f32, 11, 18, 27, 30);
  rect(g, 0x3c2e52, 6, 24, 36, 24);
  rect(g, 0x554064, 8, 25, 6, 22);
  rect(g, 0x6a4d72, 35, 25, 5, 22);
  rect(g, 0x292e39, 15, 40, 8, 13);
  rect(g, 0x292e39, 28, 40, 8, 13);
  rect(g, 0x57616a, 14, 46, 9, 7);
  rect(g, 0x57616a, 28, 46, 9, 7);
  rect(g, 0xa9b1a4, 14, 49, 9, 2);
  rect(g, 0xa9b1a4, 28, 49, 9, 2);
  rect(g, 0x303b46, 13, 22, 24, 20);
  rect(g, 0x627583, 15, 23, 20, 15);
  rect(g, 0xa3b2b2, 17, 24, 5, 12);
  rect(g, 0x465665, 25, 25, 8, 13);
  rect(g, 0xb39b6b, 14, 38, 23, 3);
  rect(g, 0x40303e, 7, 20, 10, 12);
  rect(g, 0x40303e, 34, 20, 10, 12);
  rect(g, 0x7a827d, 8, 21, 10, 8);
  rect(g, 0x7a827d, 33, 21, 10, 8);
  rect(g, 0xb8a779, 9, 21, 8, 2);
  rect(g, 0xb8a779, 34, 21, 8, 2);
  rect(g, 0x273641, 15, 5, 22, 17);
  rect(g, 0x899694, 17, 5, 18, 14);
  rect(g, 0xb5bdb0, 18, 6, 5, 10);
  rect(g, 0x3e4a56, 24, 8, 10, 11);
  rect(g, 0x172431, 19, 12, 14, 5);
  rect(g, 0xbc85d4, 20, 12, 4, 2);
  rect(g, 0xbc85d4, 28, 12, 4, 2);
  rect(g, 0xf0cedb, 21, 12, 2, 1);
  rect(g, 0xf0cedb, 29, 12, 2, 1);
  rect(g, 0xa29772, 12, 1, 4, 11);
  rect(g, 0xa29772, 36, 1, 4, 11);
  rect(g, 0xd2c298, 13, 0, 2, 8);
  rect(g, 0xd2c298, 37, 0, 2, 8);
  rect(g, 0xbca778, 17, 4, 19, 2);
  rect(g, 0xd8bd8b, 23, 1, 6, 4);
  // Broad executioner's blade is visible, but has a separate gameplay hitbox.
  rect(g, 0x393847, 1, 9, 5, 31);
  rect(g, 0x9baba9, 2, 7, 4, 25);
  rect(g, 0xc4d7c7, 2, 7, 1, 24);
  rect(g, 0xb79c64, 0, 32, 9, 3);
  rect(g, 0x716046, 3, 35, 2, 8);
  if (pose === 'walk1' || pose === 'walk2') {
    const left = pose === 'walk1';
    rect(g, 0x292e39, left ? 14 : 28, 50, 9, 3);
    rect(g, 0xa9b1a4, left ? 14 : 28, 47, 9, 2);
    rect(g, 0x809196, left ? 28 : 14, 50, 9, 2);
  } else if (pose === 'attack') {
    // Blade raised within the original frame; the feet and physics stay fixed.
    rect(g, 0x313746, 1, 1, 5, 28); rect(g, 0xc4d7c7, 2, 0, 4, 24);
    rect(g, 0xe3ead1, 2, 0, 1, 22); rect(g, 0xb79c64, 0, 25, 9, 3);
    rect(g, 0x9da9a3, 7, 17, 8, 6);
    rect(g, 0xe47770, 20, 12, 4, 2); rect(g, 0xe47770, 28, 12, 4, 2);
  }
  if (phase === 2) {
    rect(g, 0x8778c6, 23, 27, 8, 3); rect(g, 0x6fc4cf, 22, 29, 3, 6);
    rect(g, 0x6fc4cf, 24, 34, 7, 2); rect(g, 0xbadce0, 24, 29, 2, 3);
    rect(g, 0x8778c6, 9, 24, 5, 2); rect(g, 0x8778c6, 36, 24, 5, 2);
    rect(g, 0x6fc4cf, 17, 40, 2, 5); rect(g, 0x6fc4cf, 32, 40, 2, 5);
    rect(g, 0xdccde9, 20, 12, 4, 2); rect(g, 0xdccde9, 28, 12, 4, 2);
  }
}

interface PersonColors { skin: number; hair: number; coat: number; trim: number; }

const personY = (y: number, short: boolean): number => !short || y <= 13 ? y : y <= 24 ? 13 + Math.round((y - 13) * .64) : y - 4;

function paintPerson(g: Graphics, colors: PersonColors, offsetX = 0, offsetY = 0, short = false, pose: ActorPose = 'idle'): void {
  const draw = (color: number, x: number, y: number, w: number, h: number): void => {
    const top = personY(y, short);
    rect(g, color, x + offsetX, top + offsetY, w, Math.max(1, personY(y + h, short) - top));
  };
  shadow(g, offsetX + 4, offsetY + personY(28, short), 17, 4);
  const stride = pose === 'walk1' ? 1 : pose === 'walk2' ? -1 : 0;
  draw(0x1f282c, 6 + stride, 22, 5, 8); draw(0x1f282c, 14 - stride, 22, 5, 8);
  draw(0x493c32, 5 + stride, 28, 6, 3); draw(0x493c32, 14 - stride, 28, 6, 3);
  draw(shade(colors.coat, .55), 5, 13, 15, 13);
  draw(colors.coat, 7, 13, 11, 12);
  draw(shade(colors.coat, 1.2), 7, 14, 3, 8);
  draw(colors.trim, 10, 13, 3, 12);
  draw(0x554532, 6, 23, 13, 2);
  draw(colors.trim, 11, 23, 3, 2);
  draw(colors.skin, 4, 18 - stride, 3, 6); draw(colors.skin, 18, 18 + stride, 3, 6);
  draw(shade(colors.skin, .6), 7, 4, 11, 10);
  draw(colors.skin, 8, 5, 9, 9);
  draw(shade(colors.skin, 1.08), 8, 6, 4, 6);
  draw(colors.hair, 6, 2, 13, 5); draw(colors.hair, 6, 5, 3, 5);
  draw(shade(colors.hair, 1.25), 8, 3, 7, 2);
  draw(0x263037, 10, 9, 2, pose === 'blink' ? 1 : 2); draw(0x263037, 15, 9, 2, pose === 'blink' ? 1 : 2);
}

function paintNpc(g: Graphics, role: 'elder' | 'trainer' | 'forge' | 'alchemy' | 'merchant', pose: ActorPose = 'idle'): void {
  const palettes: Record<typeof role, PersonColors> = {
    elder: { skin: 0xc5a17c, hair: 0xc1c4b5, coat: 0x7d8572, trim: 0xd1b77d },
    trainer: { skin: 0xb68f73, hair: 0x363139, coat: 0x77564b, trim: 0xd6bd79 },
    forge: { skin: 0xb27d60, hair: 0x493a32, coat: 0x6a6454, trim: 0xbaa982 },
    alchemy: { skin: 0xd2b18f, hair: 0x614657, coat: 0x47776b, trim: 0xbca986 },
    merchant: { skin: 0xcca57f, hair: 0x564634, coat: 0x797040, trim: 0xd7bd75 },
  };
  paintPerson(g, palettes[role], 0, 0, false, pose);
  if (role === 'elder') {
    rect(g, 0x727365, 8, 11, 8, 6); rect(g, 0xcbd0ba, 10, 12, 6, 5);
    rect(g, 0x785e40, 21, 11, 2, 20); rect(g, 0xc2a568, 20, 10, 4, 4);
  } else if (role === 'trainer') {
    rect(g, 0x3c4549, 17, 14, 4, 7); rect(g, 0x8a9994, 18, 14, 3, 5);
    rect(g, 0xd9d8b7, 2, 9, 2, 14); rect(g, 0x829a95, 3, 10, 2, 13);
    rect(g, 0xb59b60, 0, 23, 7, 2); rect(g, 0x6d5940, 2, 25, 2, 6);
  } else if (role === 'forge') {
    rect(g, 0x503f33, 8, 16, 10, 11); rect(g, 0x8b6d4a, 9, 17, 7, 8);
    rect(g, 0x736048, 20, 12, 2, 16); rect(g, 0x7c8e90, 18, 10, 6, 5);
    rect(g, 0xb0bdb0, 18, 10, 6, 1); rect(g, 0x6a4f37, 7, 11, 10, 4);
  } else if (role === 'alchemy') {
    rect(g, 0x614657, 17, 6, 3, 14); rect(g, 0x886578, 18, 6, 1, 12);
    rect(g, 0x658a8e, 0, 18, 6, 7); rect(g, 0xa8c7b9, 1, 19, 4, 5);
    rect(g, 0x96bb82, 1, 22, 4, 2); rect(g, 0xb8a172, 2, 16, 2, 3);
    rect(g, 0xcab783, 8, 2, 8, 2);
  } else {
    rect(g, 0x383d32, 5, 1, 15, 4); rect(g, 0xb6a466, 7, 0, 11, 3);
    rect(g, 0x94724b, 17, 22, 7, 8); rect(g, 0xc3a771, 18, 23, 5, 2);
    rect(g, 0x594733, 20, 25, 1, 3);
  }
}

const PLAYER_COLORS: Record<ClassId, { coat: number; trim: number }> = {
  civilian: { coat: 0x7f7751, trim: 0xbbac7d },
  swordsman: { coat: 0x536b71, trim: 0xd2b77c },
  mage: { coat: 0x6f537c, trim: 0xb2b0ce },
};

function paintPlayer(g: Graphics, appearance: CharacterAppearance, classId: ClassId, armored: boolean, armed: boolean, pose: PlayerPose = 'idle'): void {
  const skin = colorValue(appearance.skinColor, 0xc89e7c);
  const hair = colorValue(appearance.hairColor, 0x554133);
  const classColors = PLAYER_COLORS;
  const dwarf = appearance.race === 'dwarf';
  const originY = dwarf ? 9 : 5;
  const originX = 4;
  paintPerson(g, { skin, hair, ...classColors[classId] }, originX, originY, dwarf, pose);
  const draw = (color: number, x: number, y: number, w: number, h: number): void => {
    const top = personY(y, dwarf);
    rect(g, color, x + originX, top + originY, w, Math.max(1, personY(y + h, dwarf) - top));
  };
  if (dwarf) {
    // Shorter, broader silhouette. Both genders retain balanced gameplay stats.
    draw(classColors[classId].coat, 3, 14, 4, 9);
    draw(classColors[classId].coat, 18, 14, 4, 9);
    if (appearance.gender === 'male') {
      draw(hair, 8, 11, 9, 7); draw(shade(hair, 1.3), 10, 13, 5, 5);
    }
  } else if (appearance.race === 'elf') {
    draw(shade(skin, .7), 3, 6, 5, 4); draw(skin, 4, 6, 4, 2);
    draw(shade(skin, .7), 17, 6, 5, 4); draw(skin, 17, 6, 4, 2);
    draw(hair, 8, 1, 10, 2);
  } else if (appearance.race === 'beast') {
    draw(shade(hair, .7), 5, 0, 4, 7); draw(shade(hair, .7), 16, 0, 4, 7);
    draw(skin, 6, 2, 2, 3); draw(skin, 17, 2, 2, 3);
    draw(shade(skin, .75), 9, 11, 8, 3); draw(shade(skin, 1.2), 11, 11, 4, 3);
    draw(0x31302e, 12, 11, 2, 1);
    draw(hair, 20, 20, 4, 6); draw(hair, 23, 17, 3, 6);
    draw(shade(hair, 1.2), 24, 17, 2, 4);
  }
  if (appearance.hair === 'long') {
    draw(shade(hair, .8), 5, 7, 3, 12); draw(shade(hair, .8), 17, 7, 3, 12);
    draw(shade(hair, 1.2), 6, 9, 1, 9); draw(shade(hair, 1.2), 18, 9, 1, 9);
  } else if (appearance.hair === 'braid') {
    draw(hair, 17, 5, 4, 9);
    for (let y = 13; y < 23; y += 3) {
      draw(hair, 18 + ((y % 2) ? 0 : 1), y, 3, 3);
      draw(shade(hair, 1.4), 18, y + 1, 2, 1);
    }
    draw(0xcfb677, 18, 23, 3, 2);
  } else {
    draw(hair, 11, 6, 4, 2);
    draw(shade(hair, 1.2), 11, 6, 2, 1);
  }
  if (appearance.gender === 'female') {
    draw(shade(classColors[classId].coat, .7), 6, 20, 2, 3);
    draw(shade(classColors[classId].coat, .7), 17, 20, 2, 3);
    draw(0xd3bd81, 18, 10, 1, 2);
    draw(shade(hair, .7), 9, 8, 3, 1); draw(shade(hair, .7), 14, 8, 3, 1);
  } else {
    draw(shade(hair, .6), 10, 8, 3, 1); draw(shade(hair, .6), 14, 8, 3, 1);
  }
  if (classId === 'mage') {
    draw(shade(classColors.mage.coat, .7), 6, 24, 13, 4);
    draw(classColors.mage.trim, 10, 24, 3, 4);
    if (armed) {
      const raised = pose === 'attack' ? -3 : 0;
      draw(0x746348, 22, 9 + raised, 2, 22);
      draw(0x9aa8b8, 20, 6 + raised, 6, 6);
      draw(0xb9dfe1, 21, 5 + raised, 4, 4); draw(0xe0ece0, 22, 6 + raised, 2, 2);
      if (pose === 'attack') draw(skin, 19, 13, 4, 3);
    }
  } else if (classId === 'swordsman') {
    draw(0x314950, 18, 14, 4, 7); draw(0x889a97, 19, 14, 3, 5);
    if (armed) {
      if (pose === 'attack') {
        draw(0x7e9495, 2, 29, 20, 3); draw(0xc5d4c5, 3, 29, 19, 1);
        draw(0xe3ead1, 20, 30, 3, 1); draw(0xd0b57c, 3, 27, 2, 7);
        draw(0x6d563b, 0, 30, 3, 2); draw(skin, 4, 25, 4, 3);
      } else {
        draw(0xc5d4c5, 0, 10, 2, 15); draw(0x7e9495, 2, 11, 2, 14);
        draw(0xd0b57c, 0, 25, 7, 2); draw(0x6d563b, 2, 27, 2, 4);
      }
    }
  }
  if (armored) {
    draw(0x344851, 5, 14, 15, 11); draw(0x80959a, 7, 14, 11, 9);
    draw(0xb8c5b6, 8, 15, 3, 7); draw(0x526b75, 14, 15, 3, 8);
    draw(0xc6b27a, 6, 23, 13, 2); draw(0xe4cea0, 11, 23, 3, 2);
    draw(0x6f858b, 4, 13, 5, 4); draw(0x6f858b, 17, 13, 5, 4);
    draw(0xb1beb1, 4, 13, 5, 1); draw(0xb1beb1, 17, 13, 5, 1);
  }
  if (pose === 'attack' && !armed) {
    draw(skin, 4, 24, 4, 3); draw(skin, 18, 16, 4, 3);
  }
}

function paintPlayerDirection(g: Graphics, appearance: CharacterAppearance, classId: ClassId, armored: boolean, armed: boolean, direction: ActorDirection, pose: PlayerPose): void {
  if (direction === 'down') {
    paintPlayer(g, appearance, classId, armored, armed, pose);
    return;
  }
  const skin = colorValue(appearance.skinColor, 0xc89e7c);
  const hair = colorValue(appearance.hairColor, 0x554133);
  const { coat, trim } = PLAYER_COLORS[classId];
  const dwarf = appearance.race === 'dwarf';
  const offsetY = dwarf ? 9 : 5;
  const draw = (color: number, x: number, y: number, w: number, h: number): void => {
    const top = personY(y, dwarf);
    rect(g, color, x + 4, top + offsetY, w, Math.max(1, personY(y + h, dwarf) - top));
  };
  // All frames share the old 32x42 canvas and ground contact. Animation changes
  // limb pixels only, leaving sprite origin, shadow and feet collider stable.
  shadow(g, 8, offsetY + personY(28, dwarf), 17, 4);
  const stride = pose === 'walk1' ? 1 : pose === 'walk2' ? -1 : 0;
  if (direction === 'up') {
    draw(0x1f282c, 6 + stride, 22, 5, 8); draw(0x1f282c, 14 - stride, 22, 5, 8);
    draw(0x493c32, 5 + stride, 28, 6, 3); draw(0x493c32, 14 - stride, 28, 6, 3);
    draw(shade(coat, .55), dwarf ? 3 : 5, 13, dwarf ? 19 : 15, 13);
    draw(coat, 7, 13, 11, 12); draw(shade(coat, 1.2), 7, 14, 3, 8);
    draw(shade(trim, .75), 7, 24, 11, 2);
    draw(skin, 4, 18 - stride, 3, 6); draw(shade(skin, .85), 18, 18 + stride, 3, 6);
    draw(shade(skin, .6), 7, 5, 11, 9); draw(skin, 9, 11, 7, 4);
    // Back of head has no eyes or mouth. Long hair and braid sit over the coat.
    draw(shade(hair, .65), 6, 2, 13, 12); draw(hair, 7, 2, 11, 10);
    draw(shade(hair, 1.22), 8, 3, 7, 3); draw(shade(hair, .83), 9, 10, 8, 3);
    if (appearance.hair === 'long') {
      draw(shade(hair, .65), 6, 7, 13, 14); draw(hair, 7, 8, 11, 12);
      draw(shade(hair, 1.15), 8, 9, 2, 9); draw(shade(hair, .8), 15, 10, 2, 10);
    } else if (appearance.hair === 'braid') {
      for (let y = 12; y < 23; y += 3) {
        draw(shade(hair, .7), 11 + ((y % 2) ? 0 : 1), y, 4, 3);
        draw(hair, 12, y, 2, 2);
      }
      draw(0xcfb677, 12, 23, 3, 2);
    }
    if (appearance.race === 'elf') {
      draw(shade(skin, .7), 3, 7, 4, 3); draw(skin, 3, 7, 4, 1);
      draw(shade(skin, .7), 18, 7, 4, 3); draw(skin, 18, 7, 4, 1);
    } else if (appearance.race === 'beast') {
      draw(shade(hair, .7), 5, 0, 4, 6); draw(shade(hair, .7), 16, 0, 4, 6);
      draw(skin, 6, 2, 2, 2); draw(skin, 17, 2, 2, 2);
      draw(shade(hair, .7), 13, 22, 4, 7); draw(hair, 15, 25, 7, 3);
      draw(shade(hair, 1.2), 20, 23, 3, 3);
    }
    if (classId === 'mage') {
      draw(shade(coat, .65), 6, 24, 13, 4); draw(trim, 7, 26, 11, 1);
    }
    if (armored) {
      draw(0x344851, 5, 14, 15, 11); draw(0x637e86, 7, 14, 11, 9);
      draw(0x93a7a6, 8, 15, 3, 7); draw(0x445f69, 14, 15, 3, 8);
      draw(0x6f858b, 4, 13, 5, 4); draw(0x6f858b, 17, 13, 5, 4);
      draw(0xb1beb1, 4, 13, 5, 1); draw(0xb1beb1, 17, 13, 5, 1);
      draw(0xc6b27a, 6, 23, 13, 2);
      if (appearance.hair === 'long') {
        draw(shade(hair, .65), 7, 12, 11, 9); draw(hair, 8, 12, 9, 8);
        draw(shade(hair, 1.15), 8, 12, 2, 7);
      } else if (appearance.hair === 'braid') {
        for (let y = 12; y < 23; y += 3) {
          draw(shade(hair, .7), 11 + ((y % 2) ? 0 : 1), y, 4, 3);
          draw(hair, 12, y, 2, 2);
        }
        draw(0xcfb677, 12, 23, 3, 2);
      }
    }
    if (armed && classId === 'swordsman') {
      const raised = pose === 'attack' ? -5 : 0;
      draw(0xc5d4c5, 22, 8 + raised, 2, 15); draw(0x7e9495, 24, 9 + raised, 2, 14);
      draw(0xd0b57c, 20, 23 + raised, 7, 2); draw(0x6d563b, 23, 25 + raised, 2, 4);
      if (pose === 'attack') draw(skin, 19, 14, 4, 3);
    } else if (armed && classId === 'mage') {
      const raised = pose === 'attack' ? -3 : 0;
      draw(0x746348, 0, 9 + raised, 2, 22); draw(0x9aa8b8, -2, 6 + raised, 6, 6);
      draw(0xb9dfe1, -1, 5 + raised, 4, 4); draw(0xe0ece0, 0, 6 + raised, 2, 2);
    }
    return;
  }

  const right = direction === 'right';
  const faceX = right ? 9 : 7;
  const noseX = right ? 18 : 5;
  const nearArmX = right ? 14 : 7;
  const otherArmX = right ? 7 : 15;
  draw(0x1f282c, 8 + stride, 22, 5, 8); draw(0x293238, 13 - stride, 22, 5, 8);
  draw(0x493c32, 7 + stride, 28, 6, 3); draw(0x594834, 13 - stride, 28, 6, 3);
  if (appearance.race === 'beast') {
    draw(shade(hair, .7), right ? 3 : 19, 21, 3, 7);
    draw(hair, right ? 0 : 20, 24, 5, 3); draw(shade(hair, 1.2), right ? -1 : 23, 22, 3, 3);
  }
  draw(shade(coat, .55), dwarf ? 5 : 7, 13, dwarf ? 15 : 11, 13);
  draw(coat, 8, 14, 9, 11); draw(shade(coat, 1.2), right ? 13 : 8, 15, 3, 7);
  draw(trim, right ? 16 : 7, 14, 2, 10); draw(0x554532, 7, 23, 11, 2);
  draw(shade(skin, .7), otherArmX, 17 + stride, 3, 6);
  if (classId === 'mage') {
    draw(shade(coat, .7), 7, 24, 11, 4); draw(trim, right ? 16 : 7, 24, 2, 4);
  }
  if (armored) {
    draw(0x344851, 6, 14, 13, 11); draw(0x80959a, 8, 14, 9, 9);
    draw(0xb8c5b6, right ? 13 : 8, 15, 3, 7); draw(0x526b75, right ? 8 : 14, 15, 2, 8);
    draw(0xc6b27a, 7, 23, 11, 2); draw(0x6f858b, nearArmX, 13, 5, 4);
    draw(0xb1beb1, nearArmX, 13, 5, 1);
  }
  draw(shade(skin, .65), faceX - 1, 4, 11, 11); draw(skin, faceX, 5, 9, 9);
  draw(shade(skin, 1.08), right ? faceX + 4 : faceX, 6, 4, 6);
  draw(skin, noseX, 9, 3, 3); draw(shade(skin, .65), right ? noseX : noseX + 1, 12, 2, 1);
  draw(shade(hair, .75), faceX - 1, 2, 11, 6); draw(hair, faceX, 2, 9, 4);
  draw(shade(hair, 1.22), faceX + 1, 3, 5, 2);
  draw(hair, right ? faceX - 1 : faceX + 6, 5, 4, 7);
  draw(0x263037, right ? 16 : 8, 9, 2, 2);
  if (appearance.hair === 'long') {
    const x = right ? 7 : 16;
    draw(shade(hair, .75), x, 7, 4, 13); draw(hair, x, 8, 3, 11);
    draw(shade(hair, 1.2), x, 9, 1, 9);
  } else if (appearance.hair === 'braid') {
    const x = right ? 6 : 17;
    for (let y = 10; y < 23; y += 3) {
      draw(shade(hair, .7), x + ((y % 2) ? 0 : 1), y, 3, 3);
      draw(shade(hair, 1.2), x + 1, y + 1, 1, 1);
    }
    draw(0xcfb677, x, 23, 3, 2);
  }
  if (appearance.race === 'elf') {
    const x = right ? 6 : 17;
    draw(shade(skin, .7), x, 6, 5, 3); draw(skin, x, 6, 5, 1);
  } else if (appearance.race === 'beast') {
    draw(shade(hair, .7), right ? 8 : 14, 0, 5, 7); draw(skin, right ? 10 : 15, 2, 2, 3);
    draw(shade(skin, 1.2), right ? 17 : 4, 10, 4, 3); draw(0x31302e, right ? 20 : 4, 10, 1, 1);
  } else if (dwarf && appearance.gender === 'male') {
    draw(shade(hair, .75), right ? 12 : 6, 12, 7, 7); draw(hair, right ? 13 : 6, 13, 5, 5);
    draw(shade(hair, 1.3), right ? 16 : 7, 13, 2, 4);
  }
  if (appearance.gender === 'female') draw(0xd3bd81, right ? 11 : 15, 11, 1, 2);
  const attacking = pose === 'attack';
  const handX = attacking ? right ? 19 : 2 : nearArmX;
  draw(skin, handX, attacking ? 18 : 18 - stride, attacking ? 5 : 3, attacking ? 3 : 6);
  if (armed && classId === 'swordsman') {
    if (attacking) {
      // Distinct left/right sword swings, never a flipped back/front portrait.
      draw(0x7e9495, right ? 20 : -3, 17, 8, 3); draw(0xc5d4c5, right ? 20 : -3, 17, 8, 1);
      draw(0xd0b57c, right ? 20 : 4, 15, 2, 7); draw(0x6d563b, right ? 17 : 6, 18, 3, 2);
    } else {
      const x = right ? 22 : 1;
      draw(0xc5d4c5, x, 10, 2, 15); draw(0x7e9495, x + 2, 11, 1, 14);
      draw(0xd0b57c, x - 2, 25, 7, 2); draw(0x6d563b, x + 1, 27, 2, 4);
    }
  } else if (armed && classId === 'mage') {
    const x = right ? 23 : 0;
    const raised = attacking ? -3 : 0;
    draw(0x746348, x, 9 + raised, 2, 22); draw(0x9aa8b8, x - 2, 6 + raised, 6, 6);
    draw(0xb9dfe1, x - 1, 5 + raised, 4, 4); draw(0xe0ece0, x, 6 + raised, 2, 2);
  }
}

export function playerTextureKey(appearance: CharacterAppearance, classId: ClassId, armored: boolean, armed = true, direction: ActorDirection = 'down', pose: PlayerPose = 'idle'): string {
  const hair = colorValue(appearance.hairColor, 0x554133).toString(16).padStart(6, '0');
  const skin = colorValue(appearance.skinColor, 0xc89e7c).toString(16).padStart(6, '0');
  const base = `player-${appearance.race}-${appearance.gender}-${appearance.hair}-${hair}-${skin}-${classId}-${armored ? 'armor' : 'cloth'}-${armed ? 'armed' : 'unarmed'}`;
  return direction === 'down' && pose === 'idle' ? base : `${base}-${direction}-${pose}`;
}

export function generatePlayerTexture(scene: Phaser.Scene, appearance: CharacterAppearance, classId: ClassId, armored: boolean, armed = true, direction: ActorDirection = 'down', pose: PlayerPose = 'idle'): string {
  const key = playerTextureKey(appearance, classId, armored, armed, direction, pose);
  if (createRasterPlayerTexture(scene, key, appearance, classId, armored, armed, direction, pose)) return key;
  makeTexture(scene, key, 32, 42, (g) => paintPlayerDirection(g, appearance, classId, armored, armed, direction, pose));
  return key;
}

export function generateWorldTextures(scene: Phaser.Scene): void {
  const assets: Array<[string, number, number, Paint]> = [
    ['tree', 48, 64, paintTree], ['house', 112, 96, paintHouse], ['rock', 36, 28, paintRock],
    ['bush', 30, 24, paintBush], ['pillar', 30, 42, paintPillar], ['torch', 18, 32, paintTorch],
    ['torch-blue', 18, 32, (g) => paintTorch(g, true)],
    ['flower', 16, 18, paintFlower], ['fence', 48, 24, paintFence],
    ['ore', 34, 28, paintOre], ['herb', 20, 24, paintHerb], ['seal', 64, 48, paintSeal],
    ['travel', 36, 56, paintTravel], ['secret', 32, 22, paintSecret],
    ['slime', 28, 24, paintSlime], ['wolf', 32, 28, paintWolf], ['wraith', 28, 36, paintWraith],
    ['boss', 48, 56, paintBoss],
  ];
  for (const [key, width, height, paint] of assets) makeTexture(scene, key, width, height, paint);
  const movingActors: Array<[string, number, number, (g: Graphics, pose: ActorPose) => void]> = [
    ['slime', 28, 24, paintSlime], ['wolf', 32, 28, paintWolf],
    ['wraith', 28, 36, paintWraith], ['boss', 48, 56, paintBoss],
  ];
  for (const [key, width, height, paint] of movingActors) {
    for (const pose of ['walk1', 'walk2', 'attack'] as const) {
      makeTexture(scene, `${key}-${pose}`, width, height, (g) => paint(g, pose));
    }
  }
  for (const pose of ['idle', 'walk1', 'walk2', 'attack'] as const) {
    makeTexture(scene, pose === 'idle' ? 'boss-phase2' : `boss-phase2-${pose}`, 48, 56, (g) => paintBoss(g, pose, 2));
  }
  for (const role of ['elder', 'trainer', 'forge', 'alchemy', 'merchant'] as const) {
    makeTexture(scene, `npc-${role}`, 24, 32, (g) => paintNpc(g, role));
    for (const pose of ['walk1', 'walk2', 'blink'] as const) {
      makeTexture(scene, `npc-${role}-${pose}`, 24, 32, (g) => paintNpc(g, role, pose));
    }
  }
  makeTexture(scene, 'drop', 18, 20, (g) => {
    shadow(g, 1, 16, 16, 4);
    rect(g, 0x5d4832, 3, 5, 12, 12); rect(g, 0xae8957, 5, 6, 8, 9);
    rect(g, 0xd5b475, 5, 6, 3, 8); rect(g, 0x776142, 6, 2, 6, 5);
    rect(g, 0xe0cf90, 5, 5, 8, 2); rect(g, 0xf2e0b5, 8, 9, 2, 3);
  });
  makeTexture(scene, 'projectile', 12, 12, (g) => {
    rect(g, 0x7898bc, 2, 2, 8, 8, .5); rect(g, 0x9cc2de, 3, 3, 6, 6);
    rect(g, 0xd9eef0, 4, 4, 4, 4); rect(g, 0xffffff, 5, 5, 2, 2);
  });
  makeTexture(scene, 'spark', 8, 8, (g) => {
    rect(g, 0xe0bc7c, 3, 0, 2, 8); rect(g, 0xe0bc7c, 0, 3, 8, 2);
    rect(g, 0xffedb2, 2, 2, 4, 4); rect(g, 0xffffff, 3, 3, 2, 2);
  });
}
