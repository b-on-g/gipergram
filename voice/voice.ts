namespace $ {

	export type $bog_gipergram_voice_session = {
		recorder: any
		started: number
		done: Promise< Blob >
	}

	export class $bog_gipergram_voice extends $mol_object {

		lib_uri() {
			return 'https://cdn.jsdelivr.net/npm/opus-recorder@8.0.5/dist/recorder.min.js'
		}

		worker_uri() {
			return 'https://cdn.jsdelivr.net/npm/opus-recorder@8.0.5/dist/encoderWorker.min.js'
		}

		@ $mol_mem
		encoder_path() {
			const code = this.$.$mol_fetch.text( this.worker_uri() )
			return URL.createObjectURL( new Blob( [ code ], { type: 'text/javascript' } ) )
		}

		@ $mol_mem
		ready() {
			const win = this.$.$mol_import.script( this.lib_uri() )
			return { Recorder: win.Recorder, path: this.encoder_path() }
		}

		@ $mol_mem
		session( next?: $bog_gipergram_voice_session | null ) {
			return next ?? null
		}

		recording() {
			return this.session() !== null
		}

		start() {
			const { Recorder, path } = this.ready()
			const recorder = new Recorder( {
				encoderPath: path,
				encoderApplication: 2048,
				encoderSampleRate: 48000,
				numberOfChannels: 1,
			} )
			const done = new Promise< Blob >( done => {
				recorder.ondataavailable = ( buffer: ArrayBuffer )=> done( new Blob( [ buffer ], { type: 'audio/ogg' } ) )
			} )
			recorder.start()
			this.session( { recorder, started: Date.now(), done } )
		}

		async stop() {
			const session = this.session()!
			const duration = ( Date.now() - session.started ) / 1000
			session.recorder.stop()
			this.session( null )
			const blob = await session.done
			return { file: new File( [ blob ], 'voice.ogg', { type: 'audio/ogg' } ), duration }
		}

		cancel() {
			this.session()?.recorder.stop()
			this.session( null )
		}

	}

}
