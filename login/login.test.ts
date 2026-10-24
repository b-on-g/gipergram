namespace $ {

	class $bog_gipergram_login_tg_fake extends $bog_gipergram_tg {

		started = 0

		configured() {
			return true
		}

		qr_started() {
			++ this.started
			return true
		}

	}

	function login_make( $: $ ) {
		const login = $bog_gipergram_login.make({ $ })
		const tg = $bog_gipergram_login_tg_fake.make({ $ })
		login.tg = ()=> tg
		return { login, tg }
	}

	$mol_test({

		'qr login waits for token then shows the code'( $ ) {
			const { login, tg } = login_make( $ )
			login.auto()
			$mol_assert_equal( tg.started, 1 )
			$mol_assert_equal( login.form_rows()[ 0 ], login.Qr_wait() )
			tg.qr_uri( 'tg://login?token=abc' )
			$mol_assert_equal( login.form_rows()[ 0 ], login.Qr() )
			$mol_assert_equal( login.Qr().uri(), 'tg://login?token=abc' )
		},

		'phone mode replaces qr and stops asking for it'( $ ) {
			const { login, tg } = login_make( $ )
			login.phone_mode()
			login.auto()
			$mol_assert_equal( tg.started, 0 )
			$mol_assert_equal( login.form_rows()[ 0 ], login.Phone() )
			login.qr_mode()
			$mol_assert_equal( login.form_rows()[ 0 ], login.Qr_wait() )
		},

		'password asked by qr flow goes back to it'( $ ) {
			const { login, tg } = login_make( $ )
			const asked = tg.password_ask()
			$mol_assert_equal( login.form_rows()[ 0 ], login.Password() )
			let got = ''
			asked.then( password => got = password )
			login.password( 'secret' )
			login.password_check()
			$mol_assert_equal( tg.password_wait, null )
			$mol_assert_equal( login.password(), '' )
			return asked.then( ()=> $mol_assert_equal( got, 'secret' ) )
		},

	})

}
