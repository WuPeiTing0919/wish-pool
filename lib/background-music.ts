// 背景音樂管理系統 - 修復重新播放問題
class BackgroundMusicManager {
  private audio: HTMLAudioElement | null = null
  private isPlaying = false
  private enabled = false
  private volume = 0.3
  private fadeInterval: NodeJS.Timeout | null = null

  constructor() {
    this.initAudio()
    this.loadState()
  }

  private loadState() {
    try {
      const savedState = localStorage.getItem("backgroundMusicState")
      if (savedState) {
        const state = JSON.parse(savedState)
        this.volume = state.volume || 0.3
        this.enabled = state.enabled || false
        // 不要自動恢復播放狀態，讓用戶手動控制
        this.isPlaying = false
      }
    } catch (error) {
      // 忽略載入錯誤
    }
  }

  private saveState() {
    try {
      const state = {
        volume: this.volume,
        enabled: this.enabled,
        isPlaying: this.isPlaying,
      }
      localStorage.setItem("backgroundMusicState", JSON.stringify(state))
    } catch (error) {
      // 忽略保存錯誤
    }
  }

  private initAudio() {
    try {
      this.audio = new Audio("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/just-relax-11157-iAgp15dV2YGybAezUJFtKmKZPbteXd.mp3")
      this.audio.loop = true
      this.audio.volume = this.volume
      this.audio.preload = "metadata"

      // 明確禁用自動播放相關屬性
      this.audio.autoplay = false
      this.audio.muted = false

      // 靜默處理載入完成
      this.audio.addEventListener("canplaythrough", () => {
        // 音樂載入完成
      })

      // 靜默錯誤處理
      this.audio.addEventListener("error", (e) => {
        // 重新初始化音頻對象
        this.reinitAudio()
      })

      // 播放結束處理
      this.audio.addEventListener("ended", () => {
        if (this.enabled && this.isPlaying) {
          // 重新播放
          this.audio?.play().catch(() => {
            // 如果播放失敗，重新初始化
            this.reinitAudio()
          })
        }
      })
    } catch (error) {
      // 靜默處理初始化錯誤
    }
  }

  // 重新初始化音頻對象
  private reinitAudio() {
    try {
      if (this.audio) {
        this.audio.pause()
        this.audio.src = ""
        this.audio = null
      }

      // 重新創建音頻對象
      setTimeout(() => {
        this.initAudio()
      }, 100)
    } catch (error) {
      // 靜默處理錯誤
    }
  }

  // 淡入效果
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

  // 淡出效果
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
          this.audio.currentTime = 0 // 重置播放位置
          this.audio.volume = this.volume // 恢復原始音量
        }
        return
      }

      this.audio.volume = Math.max(startVolume - volumeStep * currentStep, 0)
      currentStep++
    }, stepTime)
  }

  async start() {
    // 清除任何進行中的淡出效果
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }

    // 如果音頻對象不存在，重新初始化
    if (!this.audio) {
      this.initAudio()
      // 等待一下讓音頻對象初始化完成
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    if (!this.audio) return

    try {
      this.enabled = true
      this.isPlaying = true
      this.saveState()

      // 確保音頻對象處於正確狀態
      this.audio.currentTime = 0
      this.audio.volume = 0 // 從0開始，準備淡入

      // 開始播放並淡入
      await this.audio.play()
      this.fadeIn(2000)
    } catch (error) {
      // 播放失敗，重新初始化並重試
      this.reinitAudio()
      this.isPlaying = false
      this.enabled = false
      this.saveState()
    }
  }

  stop() {
    if (!this.audio) return

    this.enabled = false
    this.isPlaying = false
    this.saveState()

    // 清除淡入效果
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval)
      this.fadeInterval = null
    }

    // 淡出並停止
    this.fadeOut(1000)
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.audio && this.isPlaying) {
      this.audio.volume = this.volume
    }
    this.saveState()
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

  // 獲取當前狀態
  getState() {
    return {
      isPlaying: this.getIsPlaying(),
      enabled: this.enabled,
      volume: this.volume,
    }
  }

  // 獲取音樂資訊
  getMusicInfo() {
    if (!this.audio) return null

    return {
      duration: this.audio.duration || 0,
      currentTime: this.audio.currentTime || 0,
      loaded: this.audio.readyState >= 3,
    }
  }
}

// 全局背景音樂管理器
export const backgroundMusicManager = new BackgroundMusicManager()
