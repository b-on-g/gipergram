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
			this.store().anchor_move( this.peer(), this.anchor(), sent.id )
			this.reveal( sent.id, 'end' )
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

		auto() {
			this.opened()
		}

	}

}
