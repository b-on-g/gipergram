namespace $.$$ {

	export class $bog_gipergram_login extends $.$bog_gipergram_login {

		form_rows() {
			const tg = this.tg()
			if( !tg.configured() ) return [ this.Unconfigured() ]
			return [
				... this.step_rows(),
				... this.error() ? [ this.Error() ] : [],
			]
		}

		step_rows() {
			const tg = this.tg()
			if( tg.password_needed() ) return [ this.Password(), this.Password_check() ]
			if( this.mode() === 'qr' ) return [
				this.qr_uri() ? this.Qr() : this.Qr_wait(),
				this.Qr_hint(),
				this.Phone_mode(),
			]
			if( tg.code_hash() ) return [ this.Code(), this.Code_check() ]
			return [ this.Phone(), this.Code_send(), this.Qr_mode() ]
		}

		qr_uri() {
			return this.tg().qr_uri()
		}

		error() {
			return this.tg().qr_error()
		}

		auto() {
			if( this.tg().configured() && this.mode() === 'qr' ) this.tg().qr_started()
		}

		@ $mol_action
		phone_mode() {
			this.mode( 'phone' )
		}

		@ $mol_action
		qr_mode() {
			this.mode( 'qr' )
		}

		@ $mol_action
		code_send() {
			this.tg().code_send( this.phone() )
		}

		@ $mol_action
		code_check() {
			this.tg().code_check( this.phone(), this.code() )
		}

		@ $mol_action
		password_check() {
			this.tg().password_check( this.password() )
			this.password( '' )
		}

	}

}
