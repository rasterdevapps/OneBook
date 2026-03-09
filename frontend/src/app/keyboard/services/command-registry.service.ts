import { Injectable, signal, computed } from '@angular/core';
import { Command } from '../models';

/**
 * CommandRegistryService — manages the global registry of executable commands.
 *
 * Commands are actions that can be triggered via keyboard shortcuts or the
 * Command Palette. Each command has a unique id, label, optional category,
 * and an action function.
 */
@Injectable({ providedIn: 'root' })
export class CommandRegistryService {

  private readonly commandsMap = signal<Map<string, Command>>(new Map());

  /** All registered commands as a readonly signal. */
  readonly commands = computed(() => Array.from(this.commandsMap().values()));

  /** Register a command. */
  register(command: Command): void {
    this.commandsMap.update(map => {
      const next = new Map(map);
      next.set(command.id, command);
      return next;
    });
  }

  /** Register multiple commands at once. */
  registerAll(commands: Command[]): void {
    this.commandsMap.update(map => {
      const next = new Map(map);
      for (const cmd of commands) {
        next.set(cmd.id, cmd);
      }
      return next;
    });
  }

  /** Unregister a command by id. */
  unregister(id: string): void {
    this.commandsMap.update(map => {
      const next = new Map(map);
      next.delete(id);
      return next;
    });
  }

  /** Get a command by id. */
  getCommand(id: string): Command | undefined {
    return this.commandsMap().get(id);
  }

  /** Execute a command by id. Returns true if the command was found and executed. */
  execute(id: string): boolean {
    const cmd = this.commandsMap().get(id);
    if (cmd) {
      cmd.action();
      return true;
    }
    return false;
  }

  /**
   * Search commands by query string.
   * Matches against label, category, description, and keywords.
   */
  search(query: string): Command[] {
    if (!query.trim()) {
      return this.commands();
    }

    const q = query.toLowerCase();
    return this.commands().filter(cmd => {
      if (cmd.label.toLowerCase().includes(q)) return true;
      if (cmd.category?.toLowerCase().includes(q)) return true;
      if (cmd.description?.toLowerCase().includes(q)) return true;
      if (cmd.keywords?.some(kw => kw.toLowerCase().includes(q))) return true;
      return false;
    });
  }
}
