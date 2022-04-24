import { isAudio, isFile, isImage, isVideo } from '../../rules'

export const isFileX = (error?: string) => (val: any) => isFile(val, error)
export const isImageX = (error?: string) => (val: any) => isImage(val, error)
export const isVideoX = (error?: string) => (val: any) => isVideo(val, error)
export const isAudioX = (error?: string) => (val: any) => isAudio(val, error)