import { isAudio, isFile, isImage, isVideo } from '../rules'
import { VCore } from './core'

export class VFile<T> extends VCore<T> {
	constructor (err?: string) {
		super()
		this.addRule((val: T) => isFile(val, err))
	}

	image (err?: string) {
		return this.addRule((val: T) => isImage(val, err))
	}

	audio (err?: string) {
		return this.addRule((val: T) => isAudio(val, err))
	}

	video (err?: string) {
		return this.addRule((val: T) => isVideo(val, err))
	}
}
