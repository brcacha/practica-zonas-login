
// ---------------------------------------------------------------------
// logica.js
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
const ConexionBD = require( "./ConexionBD.js" )

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
class Logica {

	// .................................................................
	//
	// nombreBD: Texto
	// -->
	//    f ()
	// -->
	// Terminado // via callback()
	//
	// .................................................................
	constructor( nombreBD, callback ) {
		this.laConexion = new ConexionBD( nombreBD, callback )
	}

	// .................................................................
	// .................................................................
	cerrar() {
		this.laConexion.cerrar()
	}

	// .................................................................
	//
	// datosZona: JSON {nombre: Texto, descripcion: Texto}
	// -->
	//    f ()
	// -->
	// void / Error // via callback( err )
	//
	// .................................................................
	nuevaZona( datosZona, callback ) {

		var textoSQL = 'insert into Zona values ( $nombre, $descripcion );'
		var datos = {
			$nombre: datosZona.nombre,
			$descripcion: datosZona.descripcion
		}

		this.laConexion.modificarConPrepared( textoSQL, datos, callback )

	} // ()

	// .................................................................
	//
	//    f()
	// -->
	// Terminado // via callbak()
	//
	// .................................................................
	borrarTodosLosDatos( callback ) {
		var self = this

		//
		// borrar primero los que dependen de otros (foreign key)
		//
		this.laConexion.modificar( "delete from Vertice;", function () {
			self.laConexion.modificar( "delete from Zona;", function () {
				callback()
			})
		})
	} // ()

	// .................................................................
	//
	// nombreZona: texto
	// vertice: JSON {latitud: R, longitud: R}
	// -->
	//    f ()
	// -->
	// void / Error // via callback( err )
	//
	// .................................................................
	nuevoVerticeParaZona( nombreZona, vertice, callback ) {

		var textoSQL = 'insert into Vertice values ( $nombre, $longitud, $latitud );'
		var datos = {
			$nombre: nombreZona,
			$longitud: vertice.longitud,
			$latitud: vertice.latitud
		}

		this.laConexion.modificarConPrepared( textoSQL, datos, callback )

	} // ()

	// .................................................................

	// nombreZona: texto
	//
	// -->
	//    f ()
	// -->
	// descripcion: texto // via callback( err )

	// .................................................................
	getDescripcionDeZona( nombreZona, callback ){
		//console.log("getDescripcionDeZona(): me han llamado")

		//hay que consultar la base de datos
		var pregunta = "SELECT * FROM zona WHERE nombre = '"+ nombreZona +"';"
		//console.log(pregunta)
		this.laConexion.consultar( pregunta, function( err, res ){

			//mirar si hay error
			//si hay error, devolverlo
			//y no seguir
			if ( err ){
				callback( err, null )//devolver
				return//no seguir
			}

			//no hay Error
			//miro si el array esta vacio
			if ( res.length == 0){
				//vaya, no hay ninguna zona con ese nombre
				callback( null, null )
				return//no seguir
			}

			//no hay Error
			//si hay Resultado
			callback( null, res[0].descripcion )

			//callback(null, " ni puta idea ")
		})

	}//()
	// .................................................................
	// .................................................................
	getCoordenadasDeUnaZona( nombreZona, callback ) {
		//hay que consultar la base de datos
		var b = "SELECT * FROM vertice WHERE nombreZona = '"+ nombreZona +"';"

		this.laConexion.consultar( b, function( err, res ){

			//mirar si hay error
			//si hay error, devolverlo
			//y no seguir
			if ( err ){
				callback( err, null )//devolver
				return//no seguir
			}

			//no hay Error
			//miro si el array esta vacio
			if ( res.length == 0){
				//vaya, no hay ninguna zona con ese nombre
				callback( null, null )
				return//no seguir
			}

			//no hay Error
			//si hay Resultado
			callback( null, res )
			//console.log(res)

			})

	}
	// .................................................................
	// .................................................................
	getZona( nombreZona, callback ) {
		var a
		var that = this
		this.getDescripcionDeZona( nombreZona, function( err, res1 ){
			that.getCoordenadasDeUnaZona( nombreZona, function( err, res2 ){

				var zona = {
					descripcion: res1,
					vertices: res2
				}
				//console.log(zona)
				callback( null, zona )

			})
		})
	} // ()
	// .................................................................
	// .................................................................
	existeZona( nombreZona, callback ){
		//hay que consultar la base de datos
		var c = "SELECT * FROM zona WHERE nombre = '"+ nombreZona +"';"

		this.laConexion.consultar( c, function( err, res ){
			//mirar si hay error
			//si hay error, devolverlo
			//y no seguir
			if ( err ){
				callback( err, null )//devolver
				return//no seguir
			}//if
			if ( c == nombreZona){
				callback( true )
			}//if
			else{
				callback( false )
			}//else

		})
	}
	//modificarNombre( nombreZona, nuevoNombreZona, callback ){
		//hay que consultar la base de datos
		//var d = "SELECT * FROM zona WHERE nombre = '"+ nombreZona +"';"

		//this.laConexion.consultar( d, function( err, res ){
			//mirar si hay error
			//si hay error, devolverlo
			//y no seguir
			//if ( err ){
				//callback( err, null )//devolver
				//return//no seguir
			//}//if
			//if ( d == nombreZona){
				//var e = "UPDATE "zona" SET "nombre"="nuevoNombreZona" WHERE descripcion="marjal al lado del Grau de Gandia";"
			//callback()
			//}
		//})
	//}



} // class

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
module.exports = Logica

// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
