// TODO: rename to something more consistent with the naming convention of Visual and VisualSourceMixin

import { BaseAudio, BaseAudioOptions } from './base-audio'
import { AudioSourceMixin, AudioSourceOptions } from './audio-source'

type AudioOptions = AudioSourceOptions

/**
 * @extends AudioSource
 */
class Audio extends AudioSourceMixin<BaseAudioOptions>(BaseAudio) {
  /**
   * Creates an audio layer
   */
  constructor (options: AudioOptions) {
    super(options)
    if (this.duration === undefined)
      this.duration = (this).source.duration - this.sourceStartTime
  }

  getDefaultOptions (): AudioOptions {
    return {
      ...Object.getPrototypeOf(this).getDefaultOptions(),
      /**
       * @name module:layer.Audio#sourceStartTime
       * @desc Where in the media to start playing when the layer starts
       */
      sourceStartTime: 0,
      duration: undefined
    }
  }
}

export { Audio, AudioOptions }
