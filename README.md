# WORKS Mod Menu

An in-game cheat menu for **WORKS: Motorsport Factory** (Steam app 5119400). Press **Insert** in game.

> Unofficial fan mod, not affiliated with River Rock Games. Cheat commands permanently flag a save as
> "cheated"; the game says flagged saves get no achievements.

## Features

| Tab | What it does |
|---|---|
| Money | +10k / +100k / +1M / +10M / +100M, add or set any amount, clear all loans, rescue from insolvency. |
| Team | Hire a mechanic or designer, spawn any car class, unlock every series, record a championship finish, spawn a trophy. |
| Parts | Grant a proven design for any part type (or all of them), spawn boxed or worn parts, deliver raw materials. |
| Time | Pause, 1× / 5× / 20×, skip to morning, skip days. |
| Fix | Show or clear the task queue, cancel one task, reset stuck vehicles, check the save, run any console command. |

The top of the panel shows the save's status: day, cash, staff, cars, parts and the cheat flag.

## Install and run

1. Put `WORKSModLauncher.exe` anywhere (it finds the game through your Steam libraries).
2. Either double-click it with Steam running, or set the game's Steam launch options to
   `"C:\path\to\WORKSModLauncher.exe" %command%`.
3. Load a save and press **Insert**.

Needs the .NET 9 Desktop Runtime. The launcher writes `WORKSModLauncher.log` next to itself.

## How it works

WORKS is an Electron game whose simulation runs in a separate host process. The launcher starts
`WORKS.exe` with `--remote-debugging-port` on a random localhost port and injects `menu.js` into the
game page over the Chrome DevTools Protocol. The game files are never modified.

The game ships a developer console (the backtick key). Each menu button types a console command
into it while it is hidden, then shows the reply in the menu. Every change goes through the game's
own command path, so it is checked and logged exactly as if you had typed it yourself.

## Build

```
cd Launcher
dotnet publish -c Release -o ..\dist -p:PublishSingleFile=true --self-contained false -r win-x64
```
