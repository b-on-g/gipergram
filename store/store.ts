namespace $ {

	export class $bog_gipergram_store_data extends $giper_baza_dict.with({
		Tabs: $giper_baza_list_str,
		Split: $giper_baza_list_str,
		Anchor: $giper_baza_dict_to( $giper_baza_atom_real ),
		Anchor_prev: $giper_baza_dict_to( $giper_baza_atom_real ),
		Mine: $giper_baza_list_str,
	}) {}

	export class $bog_gipergram_store extends $mol_object {

		data() {
			return this.$.$giper_baza_glob.home().land().Data( $bog_gipergram_store_data )
		}

		auto_of( next: unknown ) {
			return next === undefined ? undefined : 'auto'
		}

		tabs( next?: string[] ): readonly string[] {
			return this.data().Tabs( this.auto_of( next ) )?.items( next ) ?? []
		}

		tab_open( peer: string ) {
			if( this.tabs().includes( peer ) ) return
			this.tabs( [ ... this.tabs(), peer ] )
		}

		tab_bump( peer: string ) {
			this.tabs( [ peer, ... this.tabs().filter( id => id !== peer ) ] )
		}

		tab_close( peer: string ) {
			this.tabs( this.tabs().filter( id => id !== peer ) )
			this.split( this.split().filter( id => id !== peer ) )
		}

		split( next?: string[] ): readonly string[] {
			return this.data().Split( this.auto_of( next ) )?.items( next ) ?? []
		}

		split_toggle( peer: string ) {
			const split = this.split()
			this.split( split.includes( peer )
				? split.filter( id => id !== peer )
				: [ ... split, peer ]
			)
		}

		anchor( peer: string, next?: number | null ): number | null {
			const auto = this.auto_of( next )
			return this.data().Anchor( auto )?.key( peer, auto )?.val( next ) ?? null
		}

		anchor_prev( peer: string, next?: number | null ): number | null {
			const auto = this.auto_of( next )
			return this.data().Anchor_prev( auto )?.key( peer, auto )?.val( next ) ?? null
		}

		anchor_move( peer: string, from: number, id: number ) {
			if( from >= id ) return
			this.anchor_prev( peer, from )
			this.anchor( peer, id )
		}

		anchor_restore( peer: string ) {
			const prev = this.anchor_prev( peer )
			if( prev === null ) return
			this.anchor( peer, prev )
			this.anchor_prev( peer, null )
		}

		mine_limit() {
			return 500
		}

		mine( next?: string[] ): readonly string[] {
			return this.data().Mine( this.auto_of( next ) )?.items( next ) ?? []
		}

		mine_add( peer: string, id: number ) {
			const key = `${ peer }:${ id }`
			const mine = this.mine()
			if( mine.includes( key ) ) return
			this.mine( [ key, ... mine ].slice( 0, this.mine_limit() ) )
		}

	}

}
