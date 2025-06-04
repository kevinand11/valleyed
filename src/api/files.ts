import { isAudio, isFile, isImage, isVideo } from '../rules'
import { VCore } from './core'
import type { File } from '../utils/types'

export class VFile extends VCore<File> {
	constructor(err?: string) {
		super()
		this.addTyping(isFile(err))
	}

	image(err?: string) {
		return this.addRule(isImage(err))
	}

	audio(err?: string) {
		return this.addRule(isAudio(err))
	}

	video(err?: string) {
		return this.addRule(isVideo(err))
	}
}
