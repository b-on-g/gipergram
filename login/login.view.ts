namespace $.$$ {

	export class $bog_gipergram_login extends $.$bog_gipergram_login {

		form_rows() {
			const tg = this.tg()
			if( !tg.configured() ) return [ this.Unconfigured() ]
			if( tg.password_needed() ) return [ this.Password(), this.Password_check() ]
			if( tg.code_hash() ) return [ this.Code(), this.Code_check() ]
			return [ this.Phone(), this.Code_send() ]
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
		}

	}

}
