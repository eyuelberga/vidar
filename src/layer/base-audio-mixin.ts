import { AudioContext, IAudioNode } from 'standardized-audio-context'
import { subscribe } from '../event'
import { Movie } from '../movie'
import { Base, BaseOptions } from './base'
import { Audio as AudioEffect } from '../effect'
import { applyOptions } from '../util'

type Constructor<T> = new (...args: unknown[]) => T

export interface BaseAudioOptions extends BaseOptions {
  audioNode?: IAudioNode<AudioContext>
}

export interface BaseAudio extends Base {
  audioNode: IAudioNode<AudioContext>
}

/*
 This mixin exists for AudioSourceMixin to extend. AudioSourceMixin exists so we
 Video can extend both AudioSource and VisualSource.
 */
export function BaseAudioMixin<OptionsSuperclass extends BaseOptions> (superclass: Constructor<Base>): Constructor<BaseAudio> {
  type MixedBaseAudioOptions = BaseAudioOptions & OptionsSuperclass

  class MixedBaseAudio extends superclass {
    readonly effects: AudioEffect[]
    audioNode: IAudioNode<AudioContext>

    // Constructor with the right `options` type
    constructor (options: MixedBaseAudioOptions) { // eslint-disable-line no-useless-constructor
      super(options)
      applyOptions(options, this)

      // Respect this.effects if it was set by Visual
      const effectsBack = this.effects || []
      this.effects = new Proxy(effectsBack, {
        deleteProperty: (target, property) => {
          const value = target[property]
          if (!isNaN(Number(property))) {
            // If attached, detach (the effect won't be attached if it is
            // attached and detached before the layer is attached to the movie)
            if (value.movie)
              value.tryDetach()

            // prev -> value -> next
            // Connect previous outputNode (value.inputNode) to next inputNode
            // (value.outputNode)
            value.inputNode.disconnect()
            value.inputNode.connect(value.outputNode)
            value.inputNode = value.outputNode = null
          }

          delete target[property]
          return true
        },

        set: (target, property, value) => {
          // The property is a number (index)
          if (!isNaN(Number(property)) && target[property] && target[property].movie)
            target[property].tryDetach()

          target[property] = value
          // If the property is a number *and* we are already attached to movie, attach this effect to self
          if (!isNaN(Number(property)) && this.movie) {
            // Now that `length` is set, set `inputNode` and `outputNode`
            const audioEffects = target.filter(effect => effect instanceof AudioEffect)
            const index = Number(property)
            const prevOutput = index === 0 ? this.audioNode : audioEffects[index - 1].outputNode
            const nextInput = index === target.length - 1 ? this.movie.actx.destination : audioEffects[index + 1].inputNode
            value.inputNode = prevOutput
            value.outputNode = nextInput

            value.tryAttach(this)
          }
          // Otherwise, attach all effects when attached to layer (then we can
          // access this.movie.actx).

          return true
        }
      })
    }

    attach (movie: Movie) {
      super.attach(movie)

      const audioEffects = this.effects.filter(effect => effect instanceof AudioEffect)
      audioEffects.forEach((effect, index) => {
        // Set `inputNode` and `outputNode`
        const prevOutput = index === 0 ? this.audioNode : audioEffects[index - 1].outputNode
        const nextInput = index === audioEffects.length - 1 ? this.movie.actx.destination : audioEffects[index + 1].inputNode
        // Disconnect from current source
        prevOutput.disconnect()
        effect.inputNode = prevOutput
        effect.outputNode = nextInput

        // attach() should make a path from inputNode to outputNode
        effect.tryAttach(this)
      })

      // TODO: on unattach?
      subscribe(movie, 'movie.audiodestinationupdate', event => {
        const n = this.effects.length
        const outputNode = n > 0 ? this.effects[n - 1].outputNode : this.audioNode
        outputNode.disconnect()
        outputNode.connect(event.destination)
      })
    }

    addEffect (effect: AudioEffect) {
      this.effects.push(effect)
      return this
    }

    detach () {
      super.detach()

      const audioEffects = this.effects.filter(effect => effect instanceof AudioEffect)
      audioEffects.forEach(effect => {
        effect.tryDetach()
      })
    }

    getDefaultOptions (): MixedBaseAudioOptions {
      return {
        ...superclass.prototype.getDefaultOptions(),
        audioNode: undefined
      }
    }
  }
  // watchPublic and publicExcludes should only care about properties that can
  // effect the screen, not the audio (because it's used to call `refresh`).
  MixedBaseAudio.prototype.publicExcludes = superclass.prototype.publicExcludes.concat(['audioNode'])

  return MixedBaseAudio
}
