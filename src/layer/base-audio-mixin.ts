import { AudioContext, IAudioNode, IAudioContext } from 'standardized-audio-context'
import { subscribe } from '../event'
import { Movie } from '../movie'
import { Base, BaseOptions } from './base'

type Constructor<T> = new (...args: unknown[]) => T

export type BaseAudioOptions = BaseOptions

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
    audioNode: IAudioNode<AudioContext>

    // Constructor with the right `options` type
    constructor (options: MixedBaseAudioOptions) { // eslint-disable-line no-useless-constructor
      super(options)
    }

    attach (movie: Movie) {
      super.attach(movie)

      // TODO: on unattach?
      subscribe(movie, 'movie.audiodestinationupdate', event => {
        this.audioNode.disconnect(movie.actx.destination)
        this.audioNode.connect(event.destination)
      })
    }
  }

  return MixedBaseAudio
}
