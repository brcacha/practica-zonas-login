// ------------------------------------------------------
//
// ReglasREST.js
//
// ------------------------------------------------------
// .......................................................
const express = require( 'express' )

//
// user: Texto
// password: Texto
// -->
//    f()
// -->
// Verdadero / Falso
// JSON datos de usuario {email, rol, nombre, apellidos}
//
// via callback( error, resultados )
//
// ..................................................
// Esta función es llamada por la regla GET /login
// .......................................................
function comprobarLoginEnBD (user, password, callback) {
	// Comprobar login no es inmediato sino
	// asíncrono ( por eso ahora lo simulo ).
	// En realidad aquío se debe consultar en
	// una BD el nombre del usuario y
	// su password (secreto compartido)
	//
	// user == email de usuario (utilizado como id/clave)
	// user no es el nombre de pila del usuario
	setTimeout (
		function () {
			if ( 2 == 1 + 1 ) { // buena comprobación
				// devuelvo que no hay error y
				// unos datos de usuario inventados
				callback (null,
						  {
							  user: user,
							  email: user + "@cliente.com",
							  rol: "cliente",
							  nombre: "Brian",
							  apellidos: "Calabuig"
						  })
			}
		},
		100)
} // ()
// ------------------------------------------------------
// ------------------------------------------------------
// reglas de peticiones REST
// ------------------------------------------------------
//con esto configuro el servidor(decirle al servidor que cuando llegue un get  /zona/marjal llame a la función que hay en la linea 24)
// ------------------------------------------------------
module.exports.cargar = function( servidorExpress, laLogica ) {

	// .......................................................
	// .......................................................
	//
	// ACREDITACION DEL USUARIO (LOGIN)
	// GET /login?user=xxx&password=yyy
	//
	// (por que es así como envía de forma automática
	// los form de html con method=get, el method=post
	// pone user=xxx&password=yyy en el body)
	//
	// .......................................................
	// .......................................................

	servidorExpress.use(express.static(__dirname + '/'));

	// SIGN IN
	servidorExpress.get('/signin', [
	    (peticion, respuesta) => respuesta.sendFile(__dirname + '/login.html')
	])

	servidorExpress.get('/login', function(req, response){

		console.log( "\n --------------------------------------- ")
		console.log( " * GET /login      " + req.url )
		console.log( " --------------------------------------- ")

		//
		//
		//
		var user = req.query.user
		var password = req.query.password

		console.log ("\t user=" + user)
		console.log ("\t password=" + password)

		var laSesion = req.session

		console.log ("\t sesion=" + JSON.stringify(laSesion) )

		//
		// ahora comprobamos usuario y password
		//
		comprobarLoginEnBD( user, password, function( err, datosUsuario ) {

			if ( ! err ) {

				//
				//  respuesta positiva
				//
				console.log ("          ** LOGIN OK **")

				//
				//  si login es correcto, hay que generar un
				// "token opaco" (codificado con una clave sólo
				//  conocida aquí) y ponerlo en las sesion (cookie)
				//  para que apartir de ahora nos lo vuelva a
				//  enviar en las futuras peticiones
				//  En ese token opaco hay que añadir el nombre
				//  del usuario acreditado, y su secreto compartido
				//
				laSesion.elTokenOpaco = JSON.stringify(
					{
						autor: "jordi", // para hacer una comprobacion simple
						comentario: "Esto es un token opaco puesto en GET /login",
						user: user,
						password, password,
						rol: datosUsuario.rol
					})

				//
				// Aunque esté en el token opaco,
				// también podemos poner el nombre del usuario en la sesion
				// para recordarlo más fácilente
				//
				laSesion.usuario = user

				//
				//
				//
				response.writeHead(200, {'Content-Type': 'text/json'})

				//
				// damos los  datos del usuario en JSON en el body
				//
				response.write( JSON.stringify( datosUsuario ) )

				response.end()

			} else {
				// ok == false
				console.log ("          ERROR EN LOGIN")

				//
				//
				//
				response.writeHead(401)  // unauthorized
				response.end()

			}

		}) // comprobarLoginEnBD

	}) // GET /login

	// .......................................................
	// .......................................................
	//  GET /prueba
	// .......................................................
	// .......................................................
	servidorExpress.get('/prueba', function(req, res){

		console.log( "\n --------------------------------------- ")
		console.log( " * GET /prueba " )
		console.log( "\t url=" + req.url )
		console.log( " --------------------------------------- ")

		//
		//
		//
		var laSesion = req.session
		console.log ( "   usuario  que me pide (antes acreditado) = " + laSesion.usuario )

		/* si quisiera cambiar o añadir cosas a la sesion
		   laSesion.elTokenOpaco = "esto es un token opaco puesto en GET /prueba"
		   laSesion.elTokenOpaco = "esto es un token opaco puesto en GET /prueba"
		   laSesion.usuario = laSesion.usuario + "x"
		*/

		//
		//
		//
		//res.writeHead(200, {'Content-Type': 'text/plain'})
		res.writeHead(200, {'Content-Type': 'text/json'})

		res.write ( '{"hola": "mundo"}' )

		res.end()

	})

	// .......................................................
	// .......................................................
	//  GET /
	// como prueba por si alguien pregunta
	// .......................................................
	// .......................................................
	servidorExpress.get('/', function(req, res){

		console.log (" * GET /" )
		console.log ("\t url=" + req.url )

		//
		//
		//
		res.writeHead(200, {'Content-Type': 'text/plain'})

		res.write ( "GET / dice: hola mundo ")

		res.end()

	})
	// ------------------------------------------------------
	// ------------------------------------------------------


	servidorExpress.get('/zona/:nombreZona/descripcion', function( req, response ){
		console.log( " ------------------------------- " )
		console.log( " * GET /zona :   " + req.url )
		console.log( " ------------------------------- " )

		const nombreZona =  req.params.nombreZona
		console.log( "\t nombreZona = " + nombreZona )

		//
		// pregunto a la lógica
		//
		laLogica.getDescripcionDeZona( nombreZona, function( err, res ) {

			if ( err ) {
				response.writeHead( 404, // not found
									{'Content-Type': 'text/plain'})
				response.write ( err )
				response.end()

				return
			}

			//
			// respuesta correcta
			//
			response.writeHead(200, {'Content-Type': 'text/json'})
			response.write ( JSON.stringify( res ) )

			//
			//
			//
			response.end()
		}) // getZona ()
				})


				servidorExpress.get('/zona/:nombreZona/vertice', function( req, response ){
					console.log( " ------------------------------- " )
					console.log( " * GET /zona/ :   " + req.url )
					console.log( " ------------------------------- " )

					const nombreZona =  req.params.nombreZona
					console.log( "\t nombreZona = " + nombreZona )

					//
					// pregunto a la lógica
					//
					laLogica.getCoordenadasDeUnaZona( nombreZona, function( err, res ) {

						if ( err ) {
							response.writeHead( 404, // not found
												{'Content-Type': 'text/plain'})
							response.write ( err )
							response.end()

							return
						}

						//
						// respuesta correcta
						//
						response.writeHead(200, {'Content-Type': 'text/json'})
						response.write ( JSON.stringify( res ) )

						//
						//
						//
						response.end()
					}) // getZona ()
							})


	// .......................................................
	// .......................................................
	//
	// GET /zona/<nombreZona>
	//
	// Ej.: GET /zona/marjal
	//
	// .......................................................
	// .......................................................
	servidorExpress.get('/zona/:nombreZona', function( req, response ){

		//
		//
		//
		console.log( " ------------------------------- " )
		console.log( " * GET /zona :   " + req.url )
		console.log( " ------------------------------- " )

		const nombreZona =  req.params.nombreZona
		console.log( "\t nombreZona = " + nombreZona )

		//
		// pregunto a la lógica
		//
		laLogica.getZona( nombreZona, function( err, res ) {

			if ( err ) {
				response.writeHead( 404, // not found
									{'Content-Type': 'text/plain'})
				response.write ( err )
				response.end()

				return
			}

			//
			// respuesta correcta
			//
			response.writeHead(200, {'Content-Type': 'text/json'})
			response.write ( JSON.stringify( res ) )

			//
			//
			//
			response.end()
		}) // getZona ()


	}) //

	// ------------------------------------------------------
	// ------------------------------------------------------
	//servidorExpress.post( "/zona/:vertice", function( req, response ))
} // module.exports

// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
