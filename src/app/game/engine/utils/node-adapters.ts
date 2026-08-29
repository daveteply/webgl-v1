/**
 * Generic node adapter utilities to safely read piece and wheel properties
 * across Three.js Object3D instances, pure domain models, and unit test mocks.
 */

export function getNodeTheta(piece: unknown): number {
  if (!piece || typeof piece !== 'object') return 0;
  const p = piece as Record<string, unknown>;
  return (p['thetaOffset'] ?? p['ThetaOffset'] ?? 0) as number;
}

export function getNodeIsRemoved(piece: unknown): boolean {
  if (!piece || typeof piece !== 'object') return false;
  const p = piece as Record<string, unknown>;
  return (p['isRemoved'] ?? p['IsRemoved'] ?? false) as boolean;
}

export function getNodeIsPowerMove(piece: unknown): boolean {
  if (!piece || typeof piece !== 'object') return false;
  const p = piece as Record<string, unknown>;
  return (p['isPowerMove'] ?? p['IsPowerMove'] ?? false) as boolean;
}

export function getNodeMatchKey(piece: unknown): number {
  if (!piece || typeof piece !== 'object') return 0;
  const p = piece as Record<string, unknown>;
  return (p['matchKey'] ?? p['MatchKey'] ?? 0) as number;
}

export function setNodeIsMatch(piece: unknown, val: boolean): void {
  if (!piece || typeof piece !== 'object') return;
  const p = piece as Record<string, unknown>;
  p['isMatch'] = val;
  if ('IsMatch' in p) {
    p['IsMatch'] = val;
  }
}

export function getNodeNext<T>(piece: unknown): T | undefined {
  if (!piece || typeof piece !== 'object') return undefined;
  const p = piece as Record<string, unknown>;
  const n = p['next'] ?? p['Next'];
  return n ? (n as T) : undefined;
}

export function getNodePrev<T>(piece: unknown): T | undefined {
  if (!piece || typeof piece !== 'object') return undefined;
  const p = piece as Record<string, unknown>;
  const pr = p['prev'] ?? p['Prev'];
  return pr ? (pr as T) : undefined;
}

export function getWheelPieces<T>(wheel: unknown): readonly T[] {
  if (!wheel || typeof wheel !== 'object') return [];
  const w = wheel as Record<string, unknown>;
  return (w['pieces'] ?? w['children'] ?? []) as readonly T[];
}

export function getWheelAbovePieces<T>(piece: unknown): readonly T[] | undefined {
  if (!piece || typeof piece !== 'object') return undefined;
  const p = piece as Record<string, unknown>;
  const pw = (p['parentWheel'] ?? p['parent']) as Record<string, unknown> | undefined;
  const aboveWheel = (pw?.['above'] ?? pw?.['Above']) as Record<string, unknown> | undefined;
  return aboveWheel ? getWheelPieces<T>(aboveWheel) : undefined;
}

export function getWheelBelowPieces<T>(piece: unknown): readonly T[] | undefined {
  if (!piece || typeof piece !== 'object') return undefined;
  const p = piece as Record<string, unknown>;
  const pw = (p['parentWheel'] ?? p['parent']) as Record<string, unknown> | undefined;
  const belowWheel = (pw?.['below'] ?? pw?.['Below']) as Record<string, unknown> | undefined;
  return belowWheel ? getWheelPieces<T>(belowWheel) : undefined;
}
