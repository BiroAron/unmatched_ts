import type { MapData, Space } from "../types/GameMap.ts";

export class GameMap {
  private spaces: Map<string, Space> = new Map();

  constructor(data: MapData) {
    data.spaces.forEach((s) => this.spaces.set(s.id, s));
  }

  public getSpace(id: string): Space | undefined {
    return this.spaces.get(id);
  }

  public areInSameZone(spaceIdA: string, spaceIdB: string): boolean {
    const spaceA = this.getSpace(spaceIdA);
    const spaceB = this.getSpace(spaceIdB);
    if (!spaceA || !spaceB) return false;

    return spaceA.zones.some((zone) => spaceB.zones.includes(zone));
  }

  public getDistance(startId: string, endId: string): number {
    if (startId === endId) return 0;

    const queue: { id: string; dist: number }[] = [{ id: startId, dist: 0 }];
    const visited = new Set([startId]);

    while (queue.length) {
      const { id, dist } = queue.shift()!;
      const space = this.spaces.get(id);

      for (const neighborId of space?.neighbors || []) {
        if (neighborId === endId) return dist + 1;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ id: neighborId, dist: dist + 1 });
        }
      }
    }
    return Infinity;
  }

  public getAvailableMoves(
    startId: string,
    distance: number,
    occupiedSpaces: string[] = [],
  ): string[] {
    const reachable: Set<string> = new Set();
    const queue: { id: string; dist: number }[] = [{ id: startId, dist: 0 }];
    const visited: Set<string> = new Set([startId]);

    while (queue.length) {
      const { id, dist } = queue.shift()!;
      if (dist > 0) reachable.add(id);

      if (dist < distance) {
        const space = this.spaces.get(id);
        space?.neighbors.forEach((neighborId) => {
          if (
            !visited.has(neighborId) &&
            !occupiedSpaces.includes(neighborId)
          ) {
            visited.add(neighborId);
            queue.push({ id: neighborId, dist: dist + 1 });
          }
        });
      }
    }
    return Array.from(reachable);
  }
}
