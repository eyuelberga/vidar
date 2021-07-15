import { AudioContext, IAudioNode } from 'standardized-audio-context';
import { Base, BaseOptions } from './base';
declare type Constructor<T> = new (...args: unknown[]) => T;
export interface BaseAudioOptions extends BaseOptions {
    audioNode?: IAudioNode<AudioContext>;
}
export interface BaseAudio extends Base {
    audioNode: IAudioNode<AudioContext>;
}
export declare function BaseAudioMixin<OptionsSuperclass extends BaseOptions>(superclass: Constructor<Base>): Constructor<BaseAudio>;
export {};
