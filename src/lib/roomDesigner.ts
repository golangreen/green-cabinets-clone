/**
 * Room Designer Logic
 * Core functionality for drawing walls, doors, windows, and managing room layouts
 */

export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
}

export interface Opening {
  id: string;
  wallId: string;
  position: number; // 0-1, position along the wall
  width: number; // in pixels
  type: 'door' | 'window';
}

export interface Room {
  walls: Wall[];
  openings: Opening[];
}

export class RoomDesignerEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private room: Room;
  private gridSize: number = 24; // 12 inches per grid square at 2px = 1"
  private wallThickness: number = 8;
  private selectedWallId: string | null = null;
  private selectedOpeningId: string | null = null;
  private tempWallStart: Point | null = null;
  private history: Room[] = [];
  private historyIndex: number = -1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;
    
    this.room = {
      walls: [],
      openings: []
    };
    
    this.setupCanvas();
    this.saveToHistory();
  }

  private setupCanvas() {
    // Set canvas size
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    
    // Set up context
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  private snapToGrid(point: Point): Point {
    return {
      x: Math.round(point.x / this.gridSize) * this.gridSize,
      y: Math.round(point.y / this.gridSize) * this.gridSize
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToHistory() {
    // Remove any redo history when making a new change
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Deep clone the room state
    this.history.push(JSON.parse(JSON.stringify(this.room)));
    this.historyIndex++;
    
    // Limit history to 50 states
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  public undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.room = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.render();
      return true;
    }
    return false;
  }

  public redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.room = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.render();
      return true;
    }
    return false;
  }

  public startWall(point: Point) {
    const snapped = this.snapToGrid(point);
    this.tempWallStart = snapped;
    this.render();
  }

  public completeWall(point: Point) {
    if (!this.tempWallStart) return;
    
    const snapped = this.snapToGrid(point);
    
    // Don't create zero-length walls
    if (snapped.x === this.tempWallStart.x && snapped.y === this.tempWallStart.y) {
      this.tempWallStart = null;
      this.render();
      return;
    }
    
    const wall: Wall = {
      id: this.generateId(),
      start: this.tempWallStart,
      end: snapped,
      thickness: this.wallThickness
    };
    
    this.room.walls.push(wall);
    this.tempWallStart = null;
    this.saveToHistory();
    this.render();
  }

  public addOpening(wallId: string, position: number, type: 'door' | 'window') {
    const width = type === 'door' ? this.gridSize * 3 : this.gridSize * 2; // 36" door, 24" window
    
    const opening: Opening = {
      id: this.generateId(),
      wallId,
      position,
      width,
      type
    };
    
    this.room.openings.push(opening);
    this.saveToHistory();
    this.render();
  }

  public deleteWall(wallId: string) {
    this.room.walls = this.room.walls.filter(w => w.id !== wallId);
    this.room.openings = this.room.openings.filter(o => o.wallId !== wallId);
    this.saveToHistory();
    this.render();
  }

  public deleteOpening(openingId: string) {
    this.room.openings = this.room.openings.filter(o => o.id !== openingId);
    this.saveToHistory();
    this.render();
  }

  public clearRoom() {
    this.room = {
      walls: [],
      openings: []
    };
    this.saveToHistory();
    this.render();
  }

  public createPresetRoom(type: 'straight' | 'l-shaped' | 'u-shaped' | 'closed') {
    this.clearRoom();
    
    const baseX = 300;
    const baseY = 200;
    const width = this.gridSize * 12; // 12 feet
    const height = this.gridSize * 10; // 10 feet
    
    switch (type) {
      case 'straight':
        // Single wall
        this.room.walls.push({
          id: this.generateId(),
          start: { x: baseX, y: baseY },
          end: { x: baseX + width, y: baseY },
          thickness: this.wallThickness
        });
        break;
        
      case 'l-shaped':
        // Two walls forming L
        this.room.walls.push(
          {
            id: this.generateId(),
            start: { x: baseX, y: baseY },
            end: { x: baseX + width, y: baseY },
            thickness: this.wallThickness
          },
          {
            id: this.generateId(),
            start: { x: baseX + width, y: baseY },
            end: { x: baseX + width, y: baseY + height },
            thickness: this.wallThickness
          }
        );
        break;
        
      case 'u-shaped':
        // Three walls forming U
        this.room.walls.push(
          {
            id: this.generateId(),
            start: { x: baseX, y: baseY },
            end: { x: baseX, y: baseY + height },
            thickness: this.wallThickness
          },
          {
            id: this.generateId(),
            start: { x: baseX, y: baseY + height },
            end: { x: baseX + width, y: baseY + height },
            thickness: this.wallThickness
          },
          {
            id: this.generateId(),
            start: { x: baseX + width, y: baseY + height },
            end: { x: baseX + width, y: baseY },
            thickness: this.wallThickness
          }
        );
        break;
        
      case 'closed':
        // Four walls forming closed room
        this.room.walls.push(
          {
            id: this.generateId(),
            start: { x: baseX, y: baseY },
            end: { x: baseX + width, y: baseY },
            thickness: this.wallThickness
          },
          {
            id: this.generateId(),
            start: { x: baseX + width, y: baseY },
            end: { x: baseX + width, y: baseY + height },
            thickness: this.wallThickness
          },
          {
            id: this.generateId(),
            start: { x: baseX + width, y: baseY + height },
            end: { x: baseX, y: baseY + height },
            thickness: this.wallThickness
          },
          {
            id: this.generateId(),
            start: { x: baseX, y: baseY + height },
            end: { x: baseX, y: baseY },
            thickness: this.wallThickness
          }
        );
        break;
    }
    
    this.saveToHistory();
    this.render();
  }

  public findWallAtPoint(point: Point, tolerance: number = 10): Wall | null {
    for (const wall of this.room.walls) {
      const distance = this.pointToLineDistance(point, wall.start, wall.end);
      if (distance <= tolerance) {
        return wall;
      }
    }
    return null;
  }

  private pointToLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  public render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw walls
    this.ctx.strokeStyle = '#f5a623';
    this.ctx.lineWidth = this.wallThickness;
    
    for (const wall of this.room.walls) {
      this.ctx.beginPath();
      this.ctx.moveTo(wall.start.x, wall.start.y);
      this.ctx.lineTo(wall.end.x, wall.end.y);
      this.ctx.stroke();
      
      // Draw wall dimensions
      this.drawWallDimensions(wall);
    }
    
    // Draw openings
    for (const opening of this.room.openings) {
      this.drawOpening(opening);
    }
    
    // Draw temporary wall being drawn
    if (this.tempWallStart) {
      this.ctx.strokeStyle = '#f5a623';
      this.ctx.globalAlpha = 0.5;
      this.ctx.setLineDash([5, 5]);
      this.ctx.beginPath();
      this.ctx.moveTo(this.tempWallStart.x, this.tempWallStart.y);
      // This will be updated with mouse position in the component
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      this.ctx.globalAlpha = 1;
    }
  }

  private drawWallDimensions(wall: Wall) {
    const length = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );
    
    const lengthInInches = Math.round((length / 2)); // 2px = 1"
    const feet = Math.floor(lengthInInches / 12);
    const inches = lengthInInches % 12;
    
    const midX = (wall.start.x + wall.end.x) / 2;
    const midY = (wall.start.y + wall.end.y) / 2;
    
    this.ctx.save();
    this.ctx.fillStyle = '#2563eb';
    this.ctx.font = 'bold 14px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const text = inches > 0 ? `${feet}'${inches}"` : `${feet}'`;
    this.ctx.fillText(text, midX, midY - 15);
    
    this.ctx.restore();
  }

  private drawOpening(opening: Opening) {
    const wall = this.room.walls.find(w => w.id === opening.wallId);
    if (!wall) return;
    
    const wallLength = Math.sqrt(
      Math.pow(wall.end.x - wall.start.x, 2) + 
      Math.pow(wall.end.y - wall.start.y, 2)
    );
    
    const position = opening.position * wallLength;
    const t = position / wallLength;
    
    const centerX = wall.start.x + t * (wall.end.x - wall.start.x);
    const centerY = wall.start.y + t * (wall.end.y - wall.start.y);
    
    // Draw opening indicator
    this.ctx.save();
    this.ctx.fillStyle = opening.type === 'door' ? '#10b981' : '#3b82f6';
    this.ctx.globalAlpha = 0.8;
    this.ctx.fillRect(
      centerX - opening.width / 2,
      centerY - this.wallThickness / 2,
      opening.width,
      this.wallThickness
    );
    this.ctx.restore();
  }

  public getRoom(): Room {
    return this.room;
  }

  public getTempWallStart(): Point | null {
    return this.tempWallStart;
  }

  public cancelTempWall() {
    this.tempWallStart = null;
    this.render();
  }
}
