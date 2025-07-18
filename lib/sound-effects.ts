// 更溫柔的音效管理系統
class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled = true

  constructor() {
    this.initAudioContext()
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.log("Audio not supported")
    }
  }

  // 創建溫柔的鈴聲效果
  private async createGentleBell(frequency = 800, duration = 0.3) {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    const filterNode = this.audioContext.createBiquadFilter()

    // 使用正弦波創建溫柔的音調
    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)

    // 低通濾波器讓聲音更柔和
    filterNode.type = "lowpass"
    filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime)
    filterNode.Q.setValueAtTime(1, this.audioContext.currentTime)

    // 溫柔的音量包絡
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)

    // 連接音頻節點
    oscillator.connect(filterNode)
    filterNode.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // 播放音效
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }

  // 創建溫柔的和弦
  private async createGentleChord(frequencies: number[], duration = 0.5) {
    if (!this.audioContext) return

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createGentleBell(freq, duration)
      }, index * 50) // 輕微延遲創造和弦效果
    })
  }

  // 創建水滴聲效果
  private async createWaterDrop() {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.15)
  }

  async play(soundName: string) {
    if (!this.enabled || !this.audioContext) return

    try {
      // 確保音頻上下文已啟動
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume()
      }

      switch (soundName) {
        case "click":
          this.createWaterDrop()
          break
        case "submit":
          this.createGentleChord([523, 659, 784], 0.6) // C大調和弦
          break
        case "success":
          this.createGentleChord([523, 659, 784, 988], 0.8) // 更豐富的和弦
          break
        case "hover":
          this.createGentleBell(1000, 0.1)
          break
      }
    } catch (error) {
      // 靜默處理錯誤
    }
  }

  toggle() {
    this.enabled = !this.enabled
  }

  isEnabled() {
    return this.enabled
  }
}

// 全局音效管理器
export const soundManager = new SoundManager()
