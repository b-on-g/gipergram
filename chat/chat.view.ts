namespace $.$$ {

	export class $bog_gipergram_chat extends $.$bog_gipergram_chat {

		dialog() {
			return this.tg().dialog( this.peer() )
		}

		chat_title() {
			return this.dialog()?.title ?? this.peer()
		}

		messages() {
			return this.tg().messages( this.peer() )
		}

		anchor() {
			return this.store().anchor( this.peer() ) ?? this.dialog()?.read_max ?? 0
		}

		@ $mol_mem
		unread() {
			const anchor = this.anchor()
			return this.messages().filter( message => message.id > anchor && !message.out )
		}

		unread_count() {
			return this.unread().length
		}

		unread_first() {
			return this.unread()[ 0 ]?.id ?? null
		}

		@ $mol_mem_key
		message( id: number ) {
			return this.messages().find( message => message.id === id )!
		}

		message_text( id: number ) {
			return this.message( id ).text
		}

		message_author( id: number ) {
			return this.message( id ).author
		}

		message_time( id: number ) {
			return new $mol_time_moment( this.message( id ).date * 1000 ).toString( 'hh:mm' )
		}

		message_out( id: number ) {
			return this.message( id ).out
		}

		message_media( id: number ) {
			return this.message( id ).media
		}

		message_width( id: number ) {
			return this.message( id ).width
		}

		message_height( id: number ) {
			return this.message( id ).height
		}

		message_image_uri( id: number ) {
			return this.tg().media_uri( [ this.peer(), id ] )
		}

		message_voice_uri( id: number ) {
			return this.tg().media_uri( [ this.peer(), id ] )
		}

		compose() {
			const recording = this.recorder().recording()
			return [
				... recording ? [ this.Recording(), this.Voice_cancel() ] : [ this.Attach(), this.Draft() ],
				this.draft().trim() ? this.Send() : this.Voice(),
			]
		}

		voice_content() {
			return [ this.recorder().recording() ? this.Voice_stop_icon() : this.Voice_start_icon() ]
		}

		voice_hint() {
			return this.recorder().recording() ? this.voice_hint_stop() : super.voice_hint()
		}

		@ $mol_action
		photo_pick( files: readonly File[] ) {
			const [ file ] = files
			if( !file ) return []
			const sent = this.tg().photo_send( this.peer(), file )
			this.sent( sent.id )
			return []
		}

		@ $mol_action
		voice_toggle() {
			const recorder = this.recorder()
			if( !recorder.recording() ) return recorder.start()
			$mol_wire_async( this ).voice_finish()
		}

		async voice_finish() {
			const { file, duration } = await this.recorder().stop()
			if( duration < 0.7 ) return
			await $mol_wire_async( this ).voice_send( file, duration )
		}

		voice_send( file: File, duration: number ) {
			const sent = this.tg().voice_send( this.peer(), file, duration )
			this.sent( sent.id )
		}

		@ $mol_action
		voice_cancel() {
			this.recorder().cancel()
		}

		@ $mol_mem
		voice_preload() {
			try {
				this.recorder().ready()
				return true
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				return false
			}
		}

		auto() {
			this.opened()
			this.voice_preload()
		}

		@ $mol_mem
		message_rows() {
			const first = this.unread_first()
			return this.messages().flatMap( message => message.id === first
				? [ this.Unread(), this.Message( message.id ) ]
				: [ this.Message( message.id ) ]
			)
		}

		unread_count_text() {
			const count = this.unread_count()
			const all = count === this.messages().length ? '+' : ''
			return count ? `${ count }${ all } ${ this.unread_count_label() }` : ''
		}

		anchor_bar() {
			return [
				this.Unread_count(),
				... this.unread().length ? [ this.Read() ] : [],
				... this.store().anchor_prev( this.peer() ) === null ? [] : [ this.Restore() ],
			]
		}

		top_id() {
			const messages = this.messages()
			return messages[ messages.length - 1 ]?.id ?? 0
		}

		@ $mol_action
		read() {
			const top = this.top_id()
			this.store().anchor_move( this.peer(), this.anchor(), top )
			this.tg().read( this.peer(), top )
		}

		@ $mol_action
		restore() {
			this.store().anchor_restore( this.peer() )
		}

		@ $mol_action
		bump() {
			this.store().tab_bump( this.peer() )
		}

		split( next?: boolean ) {
			if( next !== undefined ) this.store().split_toggle( this.peer() )
			return this.store().split().includes( this.peer() )
		}

		@ $mol_action
		close() {
			this.store().tab_close( this.peer() )
			if( this.$.$mol_state_arg.value( 'chat' ) === this.peer() ) this.$.$mol_state_arg.value( 'chat', null )
		}

		draft( next?: string ) {
			return this.$.$mol_state_local.value( 'bog_gipergram_draft_' + this.peer(), next ) ?? ''
		}

		@ $mol_action
		send() {
			const text = this.draft().trim()
			if( !text ) return
			const sent = this.tg().send( this.peer(), text )
			this.draft( '' )
			this.sent( sent.id )
		}

		sent( id: number ) {
			this.store().anchor_move( this.peer(), this.anchor(), id )
			this.reveal( id, 'end' )
		}

		reveal( id: number, align: ScrollLogicalPosition ) {
			new this.$.$mol_after_frame( ()=> this.ensure_visible( this.Message( id ), align ) )
		}

		@ $mol_mem
		loaded() {
			return this.messages().length > 0
		}

		@ $mol_mem
		opened() {
			if( !this.loaded() ) return false
			new this.$.$mol_after_frame( ()=> {
				if( this.unread_first() === null ) this.ensure_visible( this.Message( this.top_id() ), 'end' )
				else this.ensure_visible( this.Unread(), 'center' )
			} )
			return true
		}

	}

}
