import { File, isAudio, isFile, isImage, isVideo } from '../rules'
import { VCore } from './core'

export class VFile extends VCore<File> {
	static create (err?: string) {
		const v = new VFile()
		v.addRule(isFile(err))
		return v
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
