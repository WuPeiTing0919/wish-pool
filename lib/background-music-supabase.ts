import { UserSettingsService } from "./supabase-service"

// 背景音樂管理系統 - Supabase 版本
class BackgroundMusicManagerSupabase {
  private audio: HTMLAudioElement | null = null
  private isPlaying = false
  private enabled = false
  private volume = 0.3
  private fadeInterval: NodeJS.Timeout | null = null
  private initialized = false

  constructor() {
    this.initAudio()
  }

  // 初始化並載入用戶設定
  async init() {
    if (this.initialized) return

    try {
      const settings = await UserSettingsService.getUserSettings()
      if (settings) {
        this.volume = settings.background_music_volume
        this.enabled = settings.background_music_enabled
        this.isPlaying = false // 不自動播放
      }
      this.initialized = true
    } catch (error) {
      console.error("Failed to load user settings:", error)
      // 使用默認設定
      this.volume = 0.3
      this.enabled = false
      this.isPlaying = false
      this.initialized = true
    }
  }

  private initAudio() {
    try {
      this.audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/just-relax-11157-iAgp15dV2YGybAezUJFtKmKZPbteXd.mp3")
      this.audio.loop = true
      this.audio.volume = this.volume
      this.audio.preload = "metadata"
      this.audio.autoplay = false
      this.audio.muted = false

      this.audio.addEventListener("canplaythrough", () => {
        // 音樂載入完成
      })

      this.audio.addEventListener("error", (e) => {
        this.reinitAudio()
      })

      this.audio.addEventListener("ended", () => {
        if (this.enabled && this.isPlaying) {
          this.audio?.play().catch(() => {
            this.reinitAudio()
          })
        }
      })
    } catch (error) {
      console.error("Audio initialization failed:", error)
    }
  }

  private reinitAudio() {
    try {
      if (this.audio) {
        this.audio.pause()
        this.audio.src = ""
        this.audio = null
      }
      setTimeout(() => {
        this.initAudio()
      }, 100)
    } catch (error) {
      console.error("Audio reinitialization failed:", error)
    }
  }

  private fadeIn(duration = 2000) {
    if (!this.audio) return

    this.audio.volume = 0
    const targetVolume = this.volume
    const steps = 50
    const stepTime = duration / steps
    const volumeStep = targetVolume / steps

    let currentStep = 0
    this.fadeInterval = setInterval(() => {
      if (currentStep >= steps || !this.audio) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval)
          this.fadeInterval = null
        }
        if (this.audio) {
          this.audio.volume = targetVolume
        }
        return
      }

      this.audio.volume = Math.min(volumeStep * currentStep, targetVolume)
      currentStep++
    }, stepTime)
  }

  private fadeOut(duration = 1000) {
    if (!this.audio) return

    const startVolume = this.audio.volume
    const steps = 50
    const stepTime = duration / steps
    const volumeStep = startVolume / steps

    let currentStep = 0
    this.fadeInterval = setInterval(() => {
      if (currentStep >= steps || !this.audio) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval)
          this.fadeInterval = null
        }
        if (this.audio) {
          this.audio.pause()
          this.audio.currentTime = 0
          this.audio.volume = this.volume
        }
        return
      }

      this.audio.volume = Math.max(startVolume - volumeStep * currentStep, 0)
      currentStep++
    }, stepTime)
  }

  async start() {
    if (!this.initialized) await this.init()

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }

    if (!this.audio) {
      this.initAudio()
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    if (!this.audio) return

    try {
      this.enabled = true
      this.isPlaying = true

      // 保存設定到 Supabase
      await this.saveSettings()

      this.audio.currentTime = 0
      this.audio.volume = 0

      await this.audio.play()
      this.fadeIn(2000)
    } catch (error) {
      console.error("Failed to start music:", error)
      this.reinitAudio()
      this.isPlaying = false
      this.enabled = false
      await this.saveSettings()
    }
  }

  async stop() {
    if (!this.initialized) await this.init()

    if (!this.audio) return

    this.enabled = false
    this.isPlaying = false

    // 保存設定到 Supabase
    await this.saveSettings()

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }

    this.fadeOut(1000)
  }

  async setVolume(volume: number) {
    if (!this.initialized) await this.init()

    this.volume = Math.max(0, Math.min(1, volume))
    if (this.audio && this.isPlaying) {
      this.audio.volume = this.volume
    }

    // 保存設定到 Supabase
    await this.saveSettings()
  }

  // 保存設定到 Supabase
  private async saveSettings() {
    try {
      await UserSettingsService.updateUserSettings({
        backgroundMusicEnabled: this.enabled,
        backgroundMusicVolume: this.volume,
        backgroundMusicPlaying: this.isPlaying,
      })
    } catch (error) {
      console.error("Failed to save music settings:", error)
    }
  }

  getVolume() {
    return this.volume
  }

  isEnabled() {
    return this.enabled
  }

  getIsPlaying() {
    return this.isPlaying && this.audio && !this.audio.paused
  }

  getState() {
    return {
      isPlaying: this.getIsPlaying(),
      enabled: this.enabled,
      volume: this.volume,
    }
  }

  getMusicInfo() {
    if (!this.audio) return null

    return {
      duration: this.audio.duration || 0,
      currentTime: this.audio.currentTime || 0,
      loaded: this.audio.readyState >= 3,
    }
  }
}

// 全局背景音樂管理器 - Supabase 版本
export const backgroundMusicManagerSupabase = new BackgroundMusicManagerSupabase()
