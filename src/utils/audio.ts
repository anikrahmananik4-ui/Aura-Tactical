/**
 * Audio processing and sound synthesis helpers for low-latency walkie-talkie operation
 */

/**
 * Converted Float32Array to standard base64 string
 */
export function float32ArrayToBase64(array: Float32Array): string {
  const bytes = new Uint8Array(array.buffer);
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Parses a base64 string back into Float32Array for direct AudioBuffer integration
 */
export function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}

/**
 * Downsamples single channel Float32Array audio data safely to target 16kHz
 */
export function downsampleBuffer(
  buffer: Float32Array,
  inputSampleRate: number,
  outputSampleRate: number = 16000
): Float32Array {
  if (inputSampleRate === outputSampleRate) {
    return buffer;
  }
  if (outputSampleRate > inputSampleRate) {
    // Fallback: If output rate is higher, just pass through (shouldn't happen on mic input, standard is 44.1/48kHz)
    return buffer;
  }

  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  
  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;

    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }

    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

/**
 * Synthesizes a modern walkie-talkie dual-tone start transmission chirp (Motorola beep)
 */
export function playStartBeep(ctx: AudioContext) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    // Quick dual-frequency sweep to sound like a digital click chirp
    osc.frequency.setValueAtTime(750, ctx.currentTime);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.08);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (err) {
    console.error("Failed to play start beep:", err);
  }
}

/**
 * Synthesizes a realistic static squelch noise burst when a transmission ends
 */
export function playEndSquelch(ctx: AudioContext) {
  try {
    const duration = 0.14; // Short distinct 140ms burst
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill buffer with raw white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Bandpass filter to make it sound like coming out of an analog speaker grill
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 2.0;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + duration);
  } catch (err) {
    console.error("Failed to play end squelch noise:", err);
  }
}
