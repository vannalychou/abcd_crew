$(function(){

	// On cache le div du jeu et on affiche celui du menu
	$('.game').hide();
	$('.menu').show();

	var oldDistance = null; // Variable qui stock l'ancienne distance
	var notgood=50; // Largeur de la progress bar jaune en pourcent
	var good=50; // Largeur de la progress bar verte

	// Variables servant pour les phrases aléatoires
	var answer=null;
	var rand=null; 
	var answerHot = new Array();
	var answerCold = new Array();

	// Fonction générant une réponse aléatoire en fonction de si on s'éloigne/rapproche
	function get_random_answer(type){

		if(type=="cold"){
			answerCold[0] = "Tu refroifids !";
			answerCold[1] = "Mauvaise direction !";
			answerCold[2] = "Attention, tu vas te perdre !";
			answerCold[3] = "<a href=\"https://www.youtube.com/watch?v=s7L2PVdrb_8\" target=\"_blank\">La nuit est froide et pleine de terreurs ...</a>";
			answerCold[4] = "Le sens de l'orientation c'est pas ton truc !";
			answerCold[5] = "Si l'on devait comparer ton sens de l'orientation à un système d'exploitation, ça serait windows 8 !";
			answerCold[6] = "Faux !";
			answerCold[7] = "Félicitations ! Tu es officiellement dans la mauvaise direction !";
			answerCold[8] = "Gloublougloublou ! Tu comprends pas ? Bah nous on comprend pas ta trajectoire !";
			answerCold[9] = "Le but c'est de suivre les instructions, pas de faire l'inverse !";
			answerCold[10] = "Bon vu que tu comprends pas, on va tenter la psychologie inversée \"Tu es dans la bonne direction\" !";

			rand=Math.floor(Math.random()*(answerCold.length+2));

			answer=answerCold[rand];

		}else{
			answerHot[0] = "Tu te rapproches !";
			answerHot[1] = "Oui !";
			answerHot[2] = "Continue comme ça";
			answerHot[3] = "Bravo tu as gagné ! Nan je rigole mais tu es en bonne voie.";
			answerHot[4] = "<a href=\"http://www.youtube.com/watch?v=nXh2nbiSC_k\" target=\"_blank\">Allez Vin Diesel t'arrives bientôt !</a>";
			answerHot[5] = "Je voulais pas en arriver la mais je dirais que tu atteins le swag !";
			answerHot[6] = "Franchement, là, tu m'impressionnes !";
			answerHot[7] = "Tu voudrais pas m'apprendre à me déplacer aussi bien que toi ?";
			answerHot[8] = "Lache pas l'affaire !";
			answerHot[9] = "Allez on lache rien ! Penses à ta famille et fais le pour eux t\'y es presque !";
			answerHot[10] = "Doucement pas si vite ! Si tu trouves aussi vite c'est pas drôle";

			rand=Math.floor(Math.random()*(answerHot.length+2));

			answer=answerHot[rand];
		} 

		return answer;
	}

	// Fonction qui calcule la distance entre 2 pts
	function get_distance(lat_1,lon_1,lat_2,lon_2)
	{
	    var radius = 6378.137,
	        d_lat  = (lat_2 - lat_1) * Math.PI / 180,
	        d_lon  = (lon_2 - lon_1) * Math.PI / 180,
	        a      = Math.sin(d_lat/2) * Math.sin(d_lat/2) +
	                 Math.cos(lat_1 * Math.PI / 180) * Math.cos(lat_2 * Math.PI / 180) *
	                 Math.sin(d_lon/2) * Math.sin(d_lon/2),
	        c      = 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a)),
	        d      = radius * c;

	    return d * 1000; //Meters
	}

	// Fonction appelée à chaque fois qu'on change de position
	function actualPosition(position){

		// Point d'arrivée
		var end = {
			latitude: $('.lat').text(),
			longitude: $('.long').text()
		};

		// On créée la position sur l'api google maps
		var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

		// Puis on place le marker
		var marker = new google.maps.Marker({
		     position: pos,
		     map: map,
		     title: 'Vous êtes ici',
		     animation: google.maps.Animation.DROP
		});

		// Centre de la map sur l'endroit ou on est
    	map.setCenter(pos);

    	// Calcul de la distance
		distance = get_distance(
                end.latitude,
                end.longitude,
                position.coords.latitude,
                position.coords.longitude
            )/1000;

		// Si on est à moins de 50m on a gagné
		if(distance<parseFloat(0.05)){
			alert("Vous avez trouvé le trésor !!");
			location.reload(true);
		}

		// Si on est pas au premier tour
		if(oldDistance!=null){
			// Si on on se rapproche
			if(oldDistance>distance){

				// Changement de la taille de la progress bar
				good=$('.good').css("width");
				good=good.slice(0, -2);
				good=parseInt(good)+10;

				notgood=$('.notgood').css("width");
				notgood=notgood.slice(0, -2);
				notgood=parseInt(notgood)-10;

				$('.good').css("width", good+"px");
				$('.notgood').css("width", notgood+"px");

				// On affiche le message
				$('.comments').html(get_random_answer("hot"));

			// Si on s'éloigne
			}else if(oldDistance<distance){
				
				// Changement de la taille de la progress bar
				notgood=$('.notgood').css("width");
				notgood=notgood.slice(0, -2);
				notgood=parseInt(notgood)+10;

				good=$('.good').css("width");
				good=good.slice(0, -2);
				good=parseInt(good)-10;

				$('.good').css("width", good+"px");
				$('.notgood').css("width", notgood+"px");
				
				// On affiche le message
				$('.comments').html(get_random_answer("cold"));

			}
		}

		// Si en dessous de 1km, on affiche les mêtres
		if(distance<1){
			distance = distance.toFixed(3);
		}else{
			distance = distance.toFixed(1);
		}

		// On affiche la distance
		$('span.distance').text(distance+" km"); 

		// On retient la distance
		oldDistance=distance;

	}

	// Callback erreur de la géolocalisation
	function error(err) {
	  console.warn('ERROR(' + err.code + '): ' + err.message);
	};

	// Fonction appelée au début du jeu
 	function startGame(){

 		// Options de la google map
 		var mapOptions = {
			zoom: 13,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		// Création de la google map
		map = new google.maps.Map(document.getElementById('map-canvas'),
		  mapOptions);

		// Si la géolocalisation marche
		if (navigator.geolocation)
		{
			// On appelle actualPosition quand on bouge
			id = navigator.geolocation.watchPosition(actualPosition, error);
		}
		else
		{
			alert("Votre navigateur ne prend pas en compte la géolocalisation HTML5");
		}
 	}

 	// Quand on clique sur le bouton play
 	$( ".play" ).click(function() {

 		// On récupère l'adresse
		var where = $('.where').val();
		var exec = 1;

		// On fait le geocoding avec google map
		geocoder = new google.maps.Geocoder();

		geocoder.geocode( { 'address': where}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {

				$('.lat').text(results[0].geometry.location.lb);
				$('.long').text(results[0].geometry.location.mb);

			} else {
				alert("Aucun résultat ! Renseignez une adresse");
				location.reload(true);
			}
		});

		// On cache le menu
		$('.menu').slideUp().hide();
		startGame(); // Lancement du jeu
		$('.game').slideDown().show(); // On montre le jeu 

	});

});