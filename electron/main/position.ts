import fs from 'fs/promises';
import path from 'path';
import { app, screen } from 'electron';

interface Pos {
  x: number;
  y: number;
}

const filename = 'dev.position.json';
const configPath = path.join(app.getAppPath(), filename);

export async function getWindowPosition(pos: Partial<Pos>): Promise<Partial<Pos>> {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const pos = JSON.parse(content);

    // https://github.com/electron/electron/issues/526#issuecomment-497978702
    const _screen = screen.getDisplayNearestPoint({
      x: pos.x,
      y: pos.y
    });

    if (
      !(pos.x > _screen.bounds.x && pos.x < _screen.size.width) ||
      !(pos.y > _screen.bounds.y && pos.y < _screen.size.height)
    ) {
      // The requested position cannot be accesible so the nearest point is applied
      pos.x = _screen.bounds.x;
      pos.y = _screen.bounds.y;
    }

    return pos;
  } catch {
    return pos;
  }
}

export async function saveWindowPosition(pos: Pos): Promise<void> {
  await fs.writeFile(configPath, JSON.stringify(pos));
}
