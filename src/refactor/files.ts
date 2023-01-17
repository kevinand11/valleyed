import { isAudio, isFile, isImage, isVideo } from '../rules'
import { VCore } from './core'

export class VFile<T> extends VCore<T> {
	constructor (err?: string) {
		super()
		this.addRule((val: string) => isFile(val, err))
	}

	image (err?: string) {
		return this.addRule((val: number) => isImage(val, err))
	}

	audio (err?: string) {
		return this.addRule((val: number) => isAudio(val, err))
	}

	video (err?: string) {
		return this.addRule((val: number) => isVideo(val, err))
	}
}
