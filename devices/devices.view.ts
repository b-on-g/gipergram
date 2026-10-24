namespace $.$$ {

	export class $bog_gipergram_devices extends $.$bog_gipergram_devices {

		key() {
			const auth = this.$.$giper_baza_auth.current()
			return auth.toString() + auth.toStringPrivate()
		}

		base() {
			const location = this.$.$mol_dom_context.location
			return location.origin + location.pathname + location.search
		}

		link() {
			return `${ this.base() }#!account=${ this.key() }`
		}

		key_of( link: string ) {
			const raw = link.trim()
			const key = raw.match( /account=([^\/&\s]+)/ )?.[ 1 ] ?? raw
			return key.length >= 160 ? key : ''
		}

		switch( key: string ) {
			if( !key || key === this.key() ) return false
			this.$.$mol_state_local.value( '$giper_baza_auth', key )
			return true
		}

		@ $mol_mem
		imported() {
			const arg = this.$.$mol_state_arg.value( 'account' )
			if( !arg ) return false
			const changed = this.switch( this.key_of( arg ) )
			this.$.$mol_state_arg.value( 'account', null )
			if( changed ) this.$.$mol_dom_context.location.reload()
			return changed
		}

		@ $mol_action
		apply() {
			const key = this.key_of( this.input() )
			if( !key ) return this.status( this.status_wrong() )
			if( !this.switch( key ) ) return this.status( this.status_same() )
			this.$.$mol_dom_context.location.reload()
		}

	}

}
