import { File, isAudio, isFile, isImage, isVideo } from '../rules'
import { VCore } from './core'

export class VFile extends VCore<File> {
	constructor (err?: string) {
		super()
		this.addTyping(isFile(err))
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
