"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"

interface Command {
  id: string
  name: string
  description: string
  shortcut: string
  action: () => void
}

interface CommandHistory {
  command: string
  timestamp: Date
  result: string
}

interface Theme {
  name: string
  season: string
  colors: {
    primary: string
    primaryDark: string
    secondary: string
    accent: string
    background: string
    surface: string
    border: string
    text: string
    textMuted: string
    success: string
    terminal: {
      bg: string
      text: string
      prompt: string
    }
  }
}

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  speed: number
  opacity: number
  size: number
  character: string
  color: string
}

const themes: Record<string, Theme> = {
  gold: {
    name: "Gold",
    season: "autumn",
    colors: {
      primary: "bg-yellow-100",
      primaryDark: "bg-yellow-200",
      secondary: "bg-amber-50",
      accent: "bg-yellow-600",
      background: "bg-amber-25",
      surface: "bg-white",
      border: "border-amber-300",
      text: "text-amber-900",
      textMuted: "text-amber-700",
      success: "bg-yellow-100 text-yellow-800",
      terminal: {
        bg: "bg-amber-900",
        text: "text-yellow-300",
        prompt: "text-yellow-400",
      },
    },
  },
  rose: {
    name: "Rose",
    season: "spring",
    colors: {
      primary: "bg-rose-100",
      primaryDark: "bg-rose-200",
      secondary: "bg-pink-50",
      accent: "bg-rose-600",
      background: "bg-rose-25",
      surface: "bg-white",
      border: "border-rose-300",
      text: "text-rose-900",
      textMuted: "text-rose-700",
      success: "bg-rose-100 text-rose-800",
      terminal: {
        bg: "bg-rose-900",
        text: "text-rose-300",
        prompt: "text-rose-400",
      },
    },
  },
  sky: {
    name: "Sky",
    season: "winter",
    colors: {
      primary: "bg-sky-100",
      primaryDark: "bg-sky-200",
      secondary: "bg-blue-50",
      accent: "bg-sky-600",
      background: "bg-sky-25",
      surface: "bg-white",
      border: "border-sky-300",
      text: "text-sky-900",
      textMuted: "text-sky-700",
      success: "bg-sky-100 text-sky-800",
      terminal: {
        bg: "bg-sky-900",
        text: "text-sky-300",
        prompt: "text-sky-400",
      },
    },
  },
  forest: {
    name: "Forest",
    season: "summer",
    colors: {
      primary: "bg-green-100",
      primaryDark: "bg-green-200",
      secondary: "bg-emerald-50",
      accent: "bg-green-600",
      background: "bg-green-25",
      surface: "bg-white",
      border: "border-green-300",
      text: "text-green-900",
      textMuted: "text-green-700",
      success: "bg-green-100 text-green-800",
      terminal: {
        bg: "bg-green-900",
        text: "text-green-300",
        prompt: "text-green-400",
      },
    },
  },
}

const seasonalParticles = {
  spring: {
    characters: ["🌸", "🌺", "🌼", "✿", "❀", "✾"],
    colors: ["#fda4af", "#f9a8d4", "#fbcfe8", "#fce7f3"],
    count: 15,
  },
  summer: {
    characters: ["🍃", "🌿", "🌱", "🌾", "🍀", "🌳"],
    colors: ["#86efac", "#6ee7b7", "#a7f3d0", "#bbf7d0"],
    count: 12,
  },
  autumn: {
    characters: ["🍂", "🍁", "🌰", "🍄", "🌾", "🎋"],
    colors: ["#fbbf24", "#f59e0b", "#d97706", "#b45309"],
    count: 18,
  },
  winter: {
    characters: ["❄", "❅", "❆", "✦", "✧", "⋄"],
    colors: ["#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9"],
    count: 20,
  },
}

export default function LicenseManagement() {
  const [currentTheme, setCurrentTheme] = useState("gold")
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [commandInput, setCommandInput] = useState("")
  const [commandHistory, setCommandHistory] = useState<CommandHistory[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [activeTab, setActiveTab] = useState("upgrade")
  const [statusMessage, setStatusMessage] = useState("")
  const [addLicenses, setAddLicenses] = useState("2")
  const [selectedRow, setSelectedRow] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [showAnimation, setShowAnimation] = useState(false)
  const commandInputRef = useRef<HTMLInputElement>(null)
  const animationRef = useRef<number>()

  const theme = themes[currentTheme]

  const showStatus = useCallback((message: string, duration = 3000) => {
    setStatusMessage(message)
    setTimeout(() => setStatusMessage(""), duration)
  }, [])

  const createSeasonalParticles = useCallback((season: string) => {
    const config = seasonalParticles[season as keyof typeof seasonalParticles]
    const newParticles: Particle[] = []

    for (let i = 0; i < config.count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50 - Math.random() * 100,
        rotation: Math.random() * 360,
        speed: 1 + Math.random() * 3,
        opacity: 0.7 + Math.random() * 0.3,
        size: 0.8 + Math.random() * 0.4,
        character: config.characters[Math.floor(Math.random() * config.characters.length)],
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
      })
    }

    return newParticles
  }, [])

  const animateParticles = useCallback(() => {
    setParticles((prevParticles) => {
      const updatedParticles = prevParticles
        .map((particle) => ({
          ...particle,
          y: particle.y + particle.speed,
          x: particle.x + Math.sin(particle.y * 0.01) * 0.5,
          rotation: particle.rotation + 1,
          opacity: particle.opacity - 0.002,
        }))
        .filter((particle) => particle.y < window.innerHeight + 50 && particle.opacity > 0)

      if (updatedParticles.length === 0) {
        setShowAnimation(false)
        return []
      }

      return updatedParticles
    })
  }, [])

  useEffect(() => {
    if (showAnimation && particles.length > 0) {
      const animate = () => {
        animateParticles()
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [showAnimation, particles.length, animateParticles])

  const triggerSeasonalAnimation = useCallback(
    (season: string) => {
      setShowAnimation(true)
      setParticles(createSeasonalParticles(season))

      // Auto-hide animation after 5 seconds
      setTimeout(() => {
        setShowAnimation(false)
        setParticles([])
      }, 5000)
    },
    [createSeasonalParticles],
  )

  const switchTheme = useCallback(
    (themeName: string) => {
      const newTheme = themes[themeName]
      setCurrentTheme(themeName)
      showStatus(`Switched to ${newTheme.name} theme - ${newTheme.season} vibes`)
      setShowThemeSelector(false)

      // Trigger seasonal animation
      triggerSeasonalAnimation(newTheme.season)
    },
    [showStatus, triggerSeasonalAnimation],
  )

  const executeCommand = useCallback(
    (cmd: string) => {
      const timestamp = new Date()
      let result = ""

      const [command, ...args] = cmd.toLowerCase().trim().split(" ")

      switch (command) {
        case "help":
        case "h":
          result = "Available commands: help, upgrade, calculate, refresh, export, clear, status, theme, animate"
          break
        case "animate":
        case "anim":
          if (args.length === 0) {
            triggerSeasonalAnimation(theme.season)
            result = `Triggered ${theme.season} animation`
          } else {
            const season = args[0]
            if (seasonalParticles[season as keyof typeof seasonalParticles]) {
              triggerSeasonalAnimation(season)
              result = `Triggered ${season} animation`
            } else {
              result = `Unknown season: ${season}. Available: spring, summer, autumn, winter`
            }
          }
          break
        case "theme":
        case "t":
          if (args.length === 0) {
            result = `Current theme: ${theme.name}. Available: gold, rose, sky, forest`
          } else {
            const newTheme = args[0]
            if (themes[newTheme]) {
              switchTheme(newTheme)
              result = `Theme switched to ${themes[newTheme].name}`
            } else {
              result = `Unknown theme: ${newTheme}. Available: gold, rose, sky, forest`
            }
          }
          break
        case "upgrade":
        case "u":
          result = `Upgrading licenses by ${addLicenses} units...`
          showStatus("License upgrade initiated")
          break
        case "calculate":
        case "calc":
        case "c":
          result = "Calculating estimates for license changes..."
          showStatus("Estimates calculated: 211,819.35 KES")
          break
        case "refresh":
        case "r":
          result = "Refreshing license data..."
          showStatus("Data refreshed")
          break
        case "export":
        case "e":
          result = "Exporting license data to CSV..."
          showStatus("Export completed")
          break
        case "clear":
          setCommandHistory([])
          result = "Command history cleared"
          break
        case "status":
        case "s":
          result = `System status: All services operational | Theme: ${theme.name} (${theme.season})`
          break
        default:
          result = `Unknown command: ${cmd}. Type 'help' for available commands.`
      }

      setCommandHistory((prev) => [...prev, { command: cmd, timestamp, result }])
      setCommandInput("")
      setHistoryIndex(-1)
    },
    [addLicenses, showStatus, theme.name, theme.season, switchTheme, triggerSeasonalAnimation],
  )

  const commands: Command[] = [
    {
      id: "upgrade",
      name: "Upgrade Package",
      description: "Upgrade license package",
      shortcut: "⌘+1",
      action: () => {
        setActiveTab("upgrade")
        showStatus("Switched to upgrade tab")
      },
    },
    {
      id: "downgrade",
      name: "Downgrade Package",
      description: "Downgrade license package",
      shortcut: "⌘+2",
      action: () => {
        setActiveTab("downgrade")
        showStatus("Switched to downgrade tab")
      },
    },
    {
      id: "details",
      name: "License Details",
      description: "View license details",
      shortcut: "⌘+3",
      action: () => {
        setActiveTab("details")
        showStatus("Switched to details tab")
      },
    },
    {
      id: "history",
      name: "License History",
      description: "View license history",
      shortcut: "⌘+4",
      action: () => {
        setActiveTab("history")
        showStatus("Switched to history tab")
      },
    },
    {
      id: "calculate",
      name: "Calculate Estimates",
      description: "Calculate license estimates",
      shortcut: "⌘+S",
      action: () => {
        executeCommand("calculate")
      },
    },
    {
      id: "refresh",
      name: "Refresh Data",
      description: "Refresh license data",
      shortcut: "⌘+R",
      action: () => {
        executeCommand("refresh")
      },
    },
    {
      id: "export",
      name: "Export Data",
      description: "Export license data",
      shortcut: "⌘+E",
      action: () => {
        executeCommand("export")
      },
    },
    {
      id: "theme",
      name: "Theme Selector",
      description: "Switch interface theme",
      shortcut: "⌘+T",
      action: () => {
        setShowThemeSelector(!showThemeSelector)
      },
    },
    {
      id: "animate",
      name: "Seasonal Animation",
      description: "Trigger seasonal animation",
      shortcut: "⌘+A",
      action: () => {
        triggerSeasonalAnimation(theme.season)
        showStatus(`${theme.season} animation triggered!`)
      },
    },
  ]

  // Keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    // Command palette toggle
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setShowCommandPalette(!showCommandPalette)
      return
    }

    // Theme selector toggle
    if ((e.metaKey || e.ctrlKey) && e.key === "t") {
      e.preventDefault()
      setShowThemeSelector(!showThemeSelector)
      return
    }

    // Animation trigger
    if ((e.metaKey || e.ctrlKey) && e.key === "a") {
      e.preventDefault()
      triggerSeasonalAnimation(theme.season)
      showStatus(`${theme.season} animation triggered!`)
      return
    }

    // Escape to close dialogs
    if (e.key === "Escape") {
      setShowCommandPalette(false)
      setShowThemeSelector(false)
      setCommandInput("")
      return
    }

    // Theme switching with number keys
    if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
      const themeKeys = ["1", "2", "3", "4"]
      const themeNames = ["gold", "rose", "sky", "forest"]
      const keyIndex = themeKeys.indexOf(e.key)
      if (keyIndex !== -1) {
        e.preventDefault()
        switchTheme(themeNames[keyIndex])
        return
      }
    }

    // Execute shortcuts
    if (e.metaKey || e.ctrlKey) {
      const command = commands.find((cmd) => {
        const shortcut = cmd.shortcut.toLowerCase()
        if (shortcut.includes("+" + e.key.toLowerCase())) {
          return true
        }
        if (e.key >= "1" && e.key <= "4" && shortcut.includes("+" + e.key)) {
          return true
        }
        return false
      })

      if (command) {
        e.preventDefault()
        command.action()
      }
    }

    // Arrow key navigation for table rows
    if (!showCommandPalette && !showThemeSelector) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedRow((prev) => Math.min(prev + 1, 3))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedRow((prev) => Math.max(prev - 1, 0))
      }
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showCommandPalette, showThemeSelector, theme.season])

  // Command palette keyboard navigation
  useEffect(() => {
    if (showCommandPalette && commandInputRef.current) {
      commandInputRef.current.focus()
    }
  }, [showCommandPalette])

  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(commandInput)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCommandInput(commandHistory[commandHistory.length - 1 - newIndex].command)
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setCommandInput(commandHistory[commandHistory.length - 1 - newIndex].command)
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommandInput("")
      }
    }
  }

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(commandInput.toLowerCase()) ||
      cmd.description.toLowerCase().includes(commandInput.toLowerCase()),
  )

  return (
    <div className={`min-h-screen ${theme.colors.background} font-mono text-sm relative overflow-hidden`}>
      {/* Seasonal Animation Overlay */}
      {showAnimation && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute text-2xl select-none"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                transform: `rotate(${particle.rotation}deg) scale(${particle.size})`,
                opacity: particle.opacity,
                color: particle.color,
                textShadow: "0 0 3px rgba(0,0,0,0.3)",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              {particle.character}
            </div>
          ))}
        </div>
      )}

      {/* Theme Selector */}
      {showThemeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className={`${theme.colors.surface} border-2 ${theme.colors.border} w-full max-w-md`}>
            <div className={`border-b ${theme.colors.border} ${theme.colors.primary} px-3 py-2`}>
              <span className="font-bold">• THEME SELECTOR</span>
              <span className="float-right text-xs text-gray-600">ESC to close</span>
            </div>
            <div className="p-3">
              <div className="space-y-2">
                {Object.entries(themes).map(([key, themeOption], index) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 cursor-pointer border transition-all duration-200 ${
                      currentTheme === key
                        ? `${themeOption.colors.primary} ${themeOption.colors.border}`
                        : `hover:${themeOption.colors.secondary} border-gray-300`
                    }`}
                    onClick={() => switchTheme(key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${themeOption.colors.accent} border border-gray-400 rounded-sm`}></div>
                      <div>
                        <div className="font-bold">
                          {themeOption.name} <span className="text-xs text-gray-500">({themeOption.season})</span>
                        </div>
                        <div className="text-xs text-gray-600">⌘+⇧+{index + 1}</div>
                      </div>
                    </div>
                    {currentTheme === key && <div className="text-xs bg-gray-200 px-2 py-1">ACTIVE</div>}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-300 text-xs text-gray-600">
                <div className="font-bold mb-1">THEME SHORTCUTS:</div>
                <div>⌘+T: Theme selector | ⌘+⇧+1-4: Quick switch | ⌘+A: Animation</div>
                <div className="mt-2">
                  Terminal commands: <code>theme [name]</code> | <code>animate [season]</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className={`${theme.colors.surface} border-2 ${theme.colors.border} w-full max-w-2xl`}>
            <div className={`border-b ${theme.colors.border} ${theme.colors.primary} px-3 py-2`}>
              <span className="font-bold">• COMMAND PALETTE</span>
              <span className="float-right text-xs text-gray-600">ESC to close</span>
            </div>
            <div className="p-3">
              <div className="mb-3">
                <div className={`flex items-center border ${theme.colors.border} ${theme.colors.surface}`}>
                  <span className={`px-2 ${theme.colors.textMuted}`}>$</span>
                  <input
                    ref={commandInputRef}
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={handleCommandKeyDown}
                    className="flex-1 px-2 py-1 outline-none font-mono"
                    placeholder="Type a command or search..."
                  />
                </div>
              </div>

              {/* Command suggestions */}
              {commandInput && (
                <div className="mb-3">
                  <div className="text-xs text-gray-600 mb-2">COMMANDS:</div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {filteredCommands.map((cmd) => (
                      <div
                        key={cmd.id}
                        className={`flex items-center justify-between p-2 hover:${theme.colors.secondary} cursor-pointer border border-transparent hover:${theme.colors.border} transition-all duration-150`}
                        onClick={() => {
                          cmd.action()
                          setShowCommandPalette(false)
                        }}
                      >
                        <div>
                          <div className="font-bold">{cmd.name}</div>
                          <div className="text-xs text-gray-600">{cmd.description}</div>
                        </div>
                        <div className="text-xs bg-gray-200 px-2 py-1">{cmd.shortcut}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Command history */}
              {commandHistory.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-2">RECENT COMMANDS:</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                    {commandHistory
                      .slice(-5)
                      .reverse()
                      .map((entry, index) => (
                        <div key={index} className={`border-l-2 ${theme.colors.border} pl-2`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">$ {entry.command}</span>
                            <span className="text-gray-500">{entry.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <div className="text-gray-600">{entry.result}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-gray-600">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-bold mb-1">QUICK COMMANDS:</div>
                    <div>help, upgrade, calculate, refresh, theme, animate</div>
                  </div>
                  <div>
                    <div className="font-bold mb-1">SHORTCUTS:</div>
                    <div>⌘+K: Command palette | ⌘+T: Themes | ⌘+A: Animation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 space-y-6 relative z-10">
        {/* Status Bar */}
        {statusMessage && (
          <div
            className={`border ${theme.colors.border} ${theme.colors.success} px-3 py-2 text-xs transition-all duration-300 animate-pulse`}
          >
            <span className="font-bold">• STATUS:</span> {statusMessage}
          </div>
        )}

        {/* Header */}
        <div className={`border-b ${theme.colors.border} pb-4`}>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-xs ${theme.colors.textMuted}`}>BILLING → LICENSES</div>
            <div className={`text-xs ${theme.colors.textMuted} flex items-center gap-4`}>
              <span>
                THEME: {theme.name.toUpperCase()} ({theme.season.toUpperCase()})
              </span>
              <button
                onClick={() => setShowThemeSelector(true)}
                className={`border ${theme.colors.border} px-2 py-1 hover:${theme.colors.secondary} text-xs transition-colors duration-150`}
              >
                ⌘+T CHANGE
              </button>
              <button
                onClick={() => triggerSeasonalAnimation(theme.season)}
                className={`border ${theme.colors.border} px-2 py-1 hover:${theme.colors.secondary} text-xs transition-colors duration-150`}
              >
                ⌘+A ANIMATE
              </button>
              <span>⌘+K for commands</span>
            </div>
          </div>
          <h1 className={`text-lg font-bold ${theme.colors.text}`}>LICENSE MANAGEMENT</h1>
          <p className={`text-xs ${theme.colors.textMuted} mt-1`}>
            View and manage your active software licenses | Use arrow keys to navigate
          </p>
        </div>

        {/* Keyboard shortcuts help */}
        <div className={`border ${theme.colors.border} ${theme.colors.surface}`}>
          <div className={`border-b ${theme.colors.border} ${theme.colors.primary} px-3 py-2`}>
            <span className="font-bold">• KEYBOARD SHORTCUTS</span>
          </div>
          <div className="p-3 text-xs">
            <div className="grid grid-cols-4 gap-4">
              <div>⌘+K: Command palette</div>
              <div>⌘+T: Theme selector</div>
              <div>⌘+A: Seasonal animation</div>
              <div>⌘+1-4: Switch tabs</div>
              <div>⌘+S: Calculate</div>
              <div>⌘+R: Refresh</div>
              <div>⌘+E: Export</div>
              <div>⌘+⇧+1-4: Quick themes</div>
              <div>↑↓: Navigate rows</div>
              <div>ESC: Close dialogs</div>
              <div>Enter: Execute command</div>
              <div>animate [season]: Trigger animation</div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className={`border ${theme.colors.border} ${theme.colors.surface}`}>
          <div className={`border-b ${theme.colors.border} ${theme.colors.primary} px-3 py-2`}>
            <span className="font-bold">• OVERVIEW</span>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-4 gap-6 text-xs">
              <div>
                <div className={theme.colors.textMuted}>TOTAL LICENSES</div>
                <div className="font-bold text-lg">200</div>
              </div>
              <div>
                <div className={theme.colors.textMuted}>ALLOCATED</div>
                <div className="font-bold text-lg">44</div>
              </div>
              <div>
                <div className={theme.colors.textMuted}>UNALLOCATED</div>
                <div className="font-bold text-lg">156</div>
              </div>
              <div>
                <div className={theme.colors.textMuted}>RATE/USER</div>
                <div className="font-bold text-lg">1,548 KES</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className={`border ${theme.colors.border} ${theme.colors.surface}`}>
          <div className={`border-b ${theme.colors.border} ${theme.colors.primary} px-3 py-2`}>
            <span className="font-bold">• LICENSE SUBSCRIPTIONS</span>
            <span className="float-right text-xs text-gray-600">Use ↑↓ to navigate</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={`border-b ${theme.colors.border} ${theme.colors.secondary}`}>
                  <th className="text-left p-2 font-bold">ID</th>
                  <th className="text-left p-2 font-bold">SUBSCRIPTION</th>
                  <th className="text-left p-2 font-bold">COMPANY</th>
                  <th className="text-left p-2 font-bold">TYPE</th>
                  <th className="text-left p-2 font-bold">NAME</th>
                  <th className="text-center p-2 font-bold">TOTAL</th>
                  <th className="text-center p-2 font-bold">PERPETUAL</th>
                  <th className="text-left p-2 font-bold">RATE</th>
                  <th className="text-left p-2 font-bold">CURRENCY</th>
                  <th className="text-left p-2 font-bold">TYPE</th>
                  <th className="text-left p-2 font-bold">STATUS</th>
                  <th className="text-center p-2 font-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, company: "SOLUTECH SAT", total: 200, perpetual: 150 },
                  { id: 5, company: "SIRAI LIMITED", total: 10, perpetual: 10 },
                  { id: 11, company: "Sasini PLC", total: 200, perpetual: 200 },
                  { id: 12, company: "SUMMER ERP", total: 10, perpetual: 10 },
                ].map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-200 hover:${theme.colors.secondary} transition-colors duration-150 ${
                      selectedRow === index ? `${theme.colors.primary} ${theme.colors.border}` : ""
                    }`}
                  >
                    <td className="p-2">{row.id}</td>
                    <td className="p-2">Sales Automation Tool - SAT</td>
                    <td className="p-2">{row.company}</td>
                    <td className="p-2">All Users</td>
                    <td className="p-2">Billable Licenses</td>
                    <td className="p-2 text-center font-bold">{row.total}</td>
                    <td className="p-2 text-center font-bold">{row.perpetual}</td>
                    <td className="p-2">--</td>
                    <td className="p-2">KES</td>
                    <td className="p-2">Per Month</td>
                    <td className="p-2">
                      <span className={`${theme.colors.success} px-2 py-1 text-xs`}>ACTIVE</span>
                    </td>
                    <td className="p-2 text-center">
                      <button
                        className={`border ${theme.colors.border} px-2 py-1 hover:${theme.colors.secondary} transition-colors duration-150`}
                      >
                        VIEW DETAILS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* License Management Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* License Allocation */}
          <div className={`border ${theme.colors.border} ${theme.colors.surface}`}>
            <div className={`border-b ${theme.colors.border} ${theme.colors.primary} px-3 py-2`}>
              <span className="font-bold">• LICENSE ALLOCATION</span>
            </div>
            <div className="p-3 space-y-4">
              {/* Action Bar */}
              <div className={`border ${theme.colors.border}`}>
                <div className="flex text-xs">
                  <button
                    className={`px-3 py-2 border-r ${theme.colors.border} font-bold transition-colors duration-150 ${
                      activeTab === "upgrade" ? theme.colors.primary : `hover:${theme.colors.secondary}`
                    }`}
                    onClick={() => commands[0].action()}
                  >
                    ⌘+1 UPGRADE
                  </button>
                  <button
                    className={`px-3 py-2 border-r ${theme.colors.border} transition-colors duration-150 ${
                      activeTab === "downgrade" ? theme.colors.primary : `hover:${theme.colors.secondary}`
                    }`}
                    onClick={() => commands[1].action()}
                  >
                    ⌘+2 DOWNGRADE
                  </button>
                  <button
                    className={`px-3 py-2 border-r ${theme.colors.border} transition-colors duration-150 ${
                      activeTab === "details" ? theme.colors.primary : `hover:${theme.colors.secondary}`
                    }`}
                    onClick={() => commands[2].action()}
                  >
                    ⌘+3 DETAILS
                  </button>
                  <button
                    className={`px-3 py-2 transition-colors duration-150 ${
                      activeTab === "history" ? theme.colors.primary : `hover:${theme.colors.secondary}`
                    }`}
                    onClick={() => commands[3].action()}
                  >
                    ⌘+4 HISTORY
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "upgrade" && (
                <>
                  {/* Allocation Stats */}
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className={`border ${theme.colors.border} p-2 text-center`}>
                      <div className={theme.colors.textMuted}>ALL LICENSES</div>
                      <div className="font-bold text-xl">200</div>
                    </div>
                    <div className={`border ${theme.colors.border} p-2 text-center`}>
                      <div className={theme.colors.textMuted}>ALLOCATED</div>
                      <div className="font-bold text-xl">44</div>
                    </div>
                    <div className={`border ${theme.colors.border} p-2 text-center`}>
                      <div className={theme.colors.textMuted}>UNALLOCATED</div>
                      <div className="font-bold text-xl">156</div>
                    </div>
                  </div>

                  <div className={`border-t ${theme.colors.border} pt-4`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <label className={`block text-xs ${theme.colors.textMuted} mb-1`}>ADD LICENSES</label>
                        <input
                          type="number"
                          value={addLicenses}
                          onChange={(e) => setAddLicenses(e.target.value)}
                          className={`w-full border ${theme.colors.border} px-2 py-1 text-xs font-mono transition-colors duration-150 focus:${theme.colors.primary}`}
                          placeholder="2"
                        />
                      </div>
                      <div className="flex-1">
                        <label className={`block text-xs ${theme.colors.textMuted} mb-1`}>NEW TOTAL</label>
                        <div className={`border ${theme.colors.border} px-2 py-1 ${theme.colors.secondary}`}>
                          <span className="font-bold">{200 + Number.parseInt(addLicenses || "0")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className={`flex-1 border ${theme.colors.border} px-3 py-2 text-xs hover:${theme.colors.secondary} transition-colors duration-150`}
                        onClick={() => commands[4].action()}
                      >
                        ⌘+S CALCULATE
                      </button>
                      <button
                        className={`flex-1 ${theme.colors.accent} text-white px-3 py-2 text-xs hover:opacity-80 transition-opacity duration-150`}
                        onClick={() => executeCommand("upgrade")}
                      >
                        UPGRADE
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "downgrade" && (
                <div className="text-center py-8 text-gray-600">
                  <div className="text-xs">DOWNGRADE PACKAGE</div>
                  <div className="mt-2">Reduce license allocation</div>
                </div>
              )}

              {activeTab === "details" && (
                <div className="text-center py-8 text-gray-600">
                  <div className="text-xs">LICENSE DETAILS</div>
                  <div className="mt-2">View detailed license information</div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="text-center py-8 text-gray-600">
                  <div className="text-xs">LICENSE HISTORY</div>
                  <div className="mt-2">View license change history</div>
                </div>
              )}
            </div>
          </div>

          {/* Billing Information */}
          <div className={`border ${theme.colors.border} ${theme.colors.surface}`}>
            <div className={`border-b ${theme.colors.border} ${theme.colors.primary} px-3 py-2`}>
              <span className="font-bold">• BILLING SUMMARY</span>
            </div>
            <div className="p-3 space-y-4">
              <div className="text-xs space-y-2">
                <div className={`flex justify-between border-b border-gray-200 pb-1`}>
                  <span>RATE:</span>
                  <span className="font-bold">1,548.38 KES</span>
                </div>
                <div className={`flex justify-between border-b border-gray-200 pb-1`}>
                  <span>CURRENCY:</span>
                  <span className="font-bold">KES</span>
                </div>
              </div>

              <div className={`border-t ${theme.colors.border} pt-4`}>
                <div className={`text-xs ${theme.colors.textMuted} mb-3 font-bold`}>
                  ESTIMATED CHARGE FOR ADDITIONAL USERS
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Rate per user:</span>
                    <span className="font-mono">1,548.38 KES</span>
                  </div>
                  <div className="text-gray-600 text-xs">(Prorated for remaining days of current billing cycle)</div>

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span className="font-bold">211,819.35 KES</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax:</span>
                      <span className="font-bold">0 KES</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount Applied:</span>
                      <span className="font-bold">10%</span>
                    </div>
                  </div>

                  <div className={`border-t ${theme.colors.border} pt-2 mt-2`}>
                    <div className="flex justify-between font-bold">
                      <span>Gross Total:</span>
                      <span>211,819.35 KES</span>
                    </div>
                  </div>
                </div>

                <div className={`border ${theme.colors.border} ${theme.colors.secondary} p-2 mt-4 text-xs`}>
                  <span className="text-gray-600">Next billing date:</span>
                  <span className="font-bold ml-1">8th July, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Terminal */}
        <div className={`border ${theme.colors.border} ${theme.colors.terminal.bg} ${theme.colors.terminal.text}`}>
          <div className={`border-b ${theme.colors.border} ${theme.colors.primary} px-3 py-2 text-black`}>
            <span className="font-bold">• COMMAND TERMINAL</span>
            <span className="float-right text-xs text-gray-600">Type 'help' for commands</span>
          </div>
          <div className="p-3 h-32 overflow-y-auto text-xs font-mono">
            {commandHistory.slice(-3).map((entry, index) => (
              <div key={index} className="mb-2">
                <div className={theme.colors.terminal.prompt}>
                  $ {entry.command}
                  <span className="float-right text-gray-500">{entry.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className={`${theme.colors.terminal.text} ml-2`}>{entry.result}</div>
              </div>
            ))}
            <div className="flex items-center">
              <span className={theme.colors.terminal.prompt}>$ </span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleCommandKeyDown}
                className={`flex-1 bg-transparent outline-none ${theme.colors.terminal.text} ml-1`}
                placeholder="Enter command..."
              />
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className={`flex items-center justify-between text-xs border-t ${theme.colors.border} pt-4`}>
          <div className="text-gray-600">Page 1 of 1 | Total 4 items | 20 per page</div>
          <div className="flex items-center gap-2">
            <button className={`border ${theme.colors.border} px-3 py-1 text-gray-400`} disabled>
              ← PREVIOUS
            </button>
            <span className={`${theme.colors.accent} text-white px-3 py-1`}>1</span>
            <button className={`border ${theme.colors.border} px-3 py-1 text-gray-400`} disabled>
              NEXT →
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  )
}
