import * as path from 'path';

export default function makePath(dir, file) {
  return path.resolve(path.join(dir, file));
}
