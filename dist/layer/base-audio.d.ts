import { AudioContext, IAudioNode } from 'standardized-audio-context';
import { Base, BaseOptions } from './base';
declare type Constructor<T> = new (...args: unknown[]) => T;
export interface IBaseAudio extends Base {
    audioNode?: IAudioNode<AudioContext>;
}
export interface BaseAudioOptions extends BaseOptions {
    audioNode?: IAudioNode<AudioContext>;
}
export declare function BaseAudioMixin<OptionsSuperclass extends BaseOptions>(superclass: Constructor<Base>): Constructor<IBaseAudio>;
declare const BaseAudio_base: Constructor<IBaseAudio>;
export declare class BaseAudio extends BaseAudio_base {
}
export {};
