import { isAudio, isFile, isImage, isVideo } from '../rules'
import { VCore } from './core'

export class VFile<T> extends VCore<T> {
	constructor (err?: string) {
		super()
		this.addRule(isFile(err))
	}

	image (err?: string) {
		return this.addRule(isImage(err))
	}

	audio (err?: string) {
		return this.addRule(isAudio(err))
	}

	video (err?: string) {
		return this.addRule(isVideo(err))
	}
}
