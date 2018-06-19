// ------------------------------------------------------
//
// mainServidorREST.js
//
// ------------------------------------------------------

// .......................................................
// requires
// .......................................................

const express = require( 'express' )

const bodyParser = require( 'body-parser' )

const assert = require( 'assert' )

const Logica = require( "../logica/Logica.js" )

var expressSession = require('express-session')


// .......................................................
var PORT = ( process.argv[2] ? process.argv[2] : 3000 )

// .......................................................
// creación del servidor
// .......................................................
var servidorExpress = express()

// .......................................................
// servidorExpress.use ( _ ) pone un "hook"
//
// servidorExpress.use (bodyParser())
// Esto es para copiar lo que haya en el cuerpo
// de la peticion HTTP al cambo "body"  de "req"
// y que se pueda consultar luego.
//
// servidorExpress.use ( bodyParser.json() )
// .......................................................
// si siempre va a ser json mejor este body parser
servidorExpress.use ( bodyParser.text({ type: 'text/json'}) )

// si no estamos seguros, mejor este
// servidorExpress.use ( bodyParser.text({ type: 'text/plain'}) )

// .......................................................
// servidorExpress.use ( _ ) pone un "hook"
// para usar sesiones
// .......................................................
servidorExpress.use(express.static(__dirname + '/'));

// SIGN IN
servidorExpress.get('/signin', [
    (peticion, respuesta) => respuesta.sendFile(__dirname + '/login.html')
])

servidorExpress.use ( expressSession(
	{
		secret: "soy un secreto",
		//
		// OJITO con la duración de los cookies (maxAge).
		// Si la ponemos muy corta o el reloj
		// de alguna máquina no está bien,
		// el navegador/cliente rest
		// pueda que no la reenvie porque // la ve caducada.
		// Entonces aquí no llega y la verificación falla
		//
		// cookie: { maxAge: 1000*60*8 }, // 8 minutos
		cookie: { maxAge: 1000*60*60*24 }, // 1 día

		resave: true,
		saveUninitialized: true
	}
) )

// --------------------------------------------------------
// funciones de utilidad relacionadas con autentificación y autorización:
// --------------------------------------------------------

// .......................................................
//
// req: PeticionHTTP
// -->
//    f()
// -->
// V/F
//
// .......................................................
function peticionEsGetLogin (req) {

	// console.log (" peticionEsGetLogin() valorando: ", req.method, req.path, req.url)

 	if (req.path != "/login") {

		return false
	}

	if ( req.method != "GET" ) {
		return false
	}

	return true
} // ()

// .......................................................
//
// req: PeticionHTTP
// -->
//    f()
// -->
// V/F
//
// .......................................................
function peticionTienePermisos( req ) {

	console.log (" * comprobando permisos ")

	//
	// sacamos el token opaco de la sesion (viaja como cookie)
	//
	var laSesion = req.session

	// console.log ("\t sesion=" + JSON.stringify(laSesion) )
	console.log ("\t token opaco que viaja como cookie=" + laSesion.elTokenOpaco )

	//
	// el token opaco debería haber sido encriptado
	// aquí se desencriptaría antes del parse
	//
	try {
		var elToken = JSON.parse( laSesion.elTokenOpaco )
	} catch ( err ) {
		console.log(" * el token no parece auténtico: :-( Permiso no concedido")
		return false
	}

	//
	// Como es una prueba, ahora, compruebo algo simple
	//
	if ( elToken.autor != "jordi" )  {
		console.log(" * el token no parece auténtico: :-( Permiso no concedido")
		return false
	}

	console.log (" el token parece bueno: permisos OK")
	return true

	/*
	  La comprobación con el token opaco sería:
	  el programa cliente sabe el nombre de usuario 'juan' p.ej y el secreto compartido
	  secreto compartido <- 1234('juan') // 1234 solo lo sabe el ser humano
	  y no lo guarda ninguna máquina
	  secreto compartido también están en la base de datos como password de juan
	  (por eso es compartido)
	  El secrto cmpartido se pone en el token opaco (es opaco porque va codificado
	  con una clave conocida sólo aquí), también se pone el nombre del usuario.

	  Para probar su identidad, el programa cliente envia el token opaco
	  y el nombre del usuario codificado con el secreto compartido

	  Aquí, abriríamos el token opaco para sacar el secreto comnpartido
	  y con el decodificar la prueba que debe dar el nombre del usuario
	 */
} // ()

// .......................................................
// servidorExpress.use ( _ ) pone un "hook"
//
// Este hook hace que en la respuesta
// esté siempre el campo de cabecera:
// Access-Control-Allow-Origin
// con el correspondiente valor
//
// Lo necesito porque tengo páginas html servidas
// en localhost:8080 por un servidor python (en todo caso,
// diferente de éste)
// y el código html de esas páginas hace peticiones REST a
// aquí (que lo sirve este servidor node.js en localhost:8081)
//
// De esta forma, el navegador acepta que una página
// cargada desde 8080 haga preguntas a aquí 8081
// se llama CORS  (cross origin resource sharing)
//
// Igualmente, Allow-Credentials para que el navegador
// guarde y re-envie los cookies de forma automática
// ya que el código javascript de la págna html tiene
// prohibido el acceso a las cookies
//
// .......................................................
servidorExpress.use (function(req, res, next) {

	res.setHeader ('Access-Control-Allow-Origin', "http://localhost:3000")
	res.setHeader ('Access-Control-Allow-Credentials', "true" )

	// res.setHeader ('Access-Control-Allow-Methods', "put" )

	next ()

})

// .......................................................
// servidorExpress.use ( _ ) pone un "hook"
//
// Esto es una "interceptación" ANTES
// de llamar a las reglas de REST:
// inserto código para comprobar que la petición
// si no es de login, tiene permisos.
// Tener permisos significa que la petición
// en una cookie llava un token opaco
// que se le entrega al cliente tras un login correcto.
// para que lo reenvíe siempre.
//
// Si la petición es de login, la dejo pasar
// hasta la regla correspondiente GET /login
// para que allí se compruebe usuario-password
// .......................................................
servidorExpress.use (function(req, res, next) {

	console.log ("\n -------------------------------------------")
	console.log (" -- hook antes de la reglas inspecciona peticion ----")
	console.log ("\t method = " + req.method )
	console.log ("\t url    =" + req.url )
	console.log (" --------------------------------------------- ")

	//
	// si la petición es de login, la dejo pasar
	//
	if ( peticionEsGetLogin (req) ) {
		console.log (" * es login ")
		next () // la peticion continua
		return
	}

	//
	//
	//
	console.log (" * no es login: debo comprobar si tiene permisos ")

	//
	// Como no es login voy a mirar si tiene permisos.
	// Lo hace la función de utilidad inspeccionando
	// el token opaco que viaja como cookie en la peición.
	// Una ventaja de esto es que la comprobración es síncrona
	// porque lo que hay que mirar (el token opaco en la cookie)
	// ya lo tenemos (y no hace falta hacer consultar en la BD, pj.)
	//
	if (! peticionTienePermisos (req) ){
		console.log (" * no tiene permisos ")
		res.writeHead(401)  // unauthorized
		res.end()
		return // acabo sin llamar a next()
	}

	//
	//
	//
	console.log (" * sí que tiene permisos ")

    next() // la petición contiúa
})



// .......................................................
// esto es para capturar control-c
// y cerrar el servicio ordenadamente
// .......................................................
process.on('SIGINT', function() {
	console.log (" terminando ")
	servidorExpress.close ()
})

// ------------------------------------------------------
// ------------------------------------------------------
// "main()"
// ------------------------------------------------------
// ------------------------------------------------------

//
// abro conexion a logica, cargo las reglas
// y luego arranco servidor
//
laLogica = new Logica(
    "../datos/Zonas.bd",
    function( err ) {
        assert.ok( ! err, " conexión a BD fallada: " + err)

		//
		// cargo las reglas REST
		//
		var reglas = require( './ReglasREST.js' )

		reglas.cargar( servidorExpress, laLogica )

		//
		// arranco el servidor
		//
		console.log ("todo preparado, espero en 3000 (http)")
		servidorExpress.listen (3000)

    })

// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
// ------------------------------------------------------
