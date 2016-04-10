function divElementEnostavniTekst(sporocilo) {
  var jeSmesko = sporocilo.indexOf('http://sandbox.lavbic.net/teaching/OIS/gradivo/') > -1;
  var jeSlika = sporocilo.indexOf('.jpg') > -1 || sporocilo.indexOf('.gif') > -1 || sporocilo.indexOf('.png') > -1;
  var jeVideo = sporocilo.indexOf('www.youtube.com/watch?v=') > -1;
  
  //---------------------------------------------------------------------------------- naloga 2
  
  if(jeSlika){
    sporocilo = sporocilo.replace('&lt;img', '<img').replace('png\' /&gt;', 'png\' />').replace('gif\' /&gt;', 'gif\' />');
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
  }
  //---------------------------------------------------------------------------------- naloga 2
  
  //-----------------------------------------------------------------------------------naloga 3
  else if(jeVideo){
    
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
  }
  //-----------------------------------------------------------------------------------naloga 3
  
  else if (jeSmesko) {
    sporocilo = sporocilo.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace('&lt;img', '<img').replace('png\' /&gt;', 'png\' />');
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
  } else {
    return $('<div style="font-weight: bold;"></div>').text(sporocilo);
  }
 
}
//--------------------------------------------------------------------------- Dodatni test vnosa
function test(sporocilo) {
  var jeSmesko = sporocilo.indexOf('http://sandbox.lavbic.net/teaching/OIS/gradivo/') > -1;
  var jeSlika = sporocilo.indexOf('.jpg') > -1 || sporocilo.indexOf('.gif') > -1 || sporocilo.indexOf('.png') > -1;
  var jeVideo = sporocilo.indexOf('www.youtube.com/watch?v=') > -1;
  
  if(jeSlika){
    return 1;
  }
  else if (jeSmesko) {
    return 2;
  }
  else if(jeVideo){
    return 3;
  }
  else{
    return 4;
  }
 
}
//--------------------------------------------------------------------------- Dodatni test vnosa

function divElementHtmlTekst(sporocilo) {
  return $('<div></div>').html('<i>' + sporocilo + '</i>');
}

function procesirajVnosUporabnika(klepetApp, socket) {
  var sporocilo = $('#poslji-sporocilo').val();
  
  //----------------------------------------------------------------- naloga 2,3
  if(test(sporocilo) == 1){
    sporocilo = dodajSliko(sporocilo);
  }
  else if(test(sporocilo) == 3){
    sporocilo = dodajVideo(sporocilo);
  }
  else{
    sporocilo = dodajSmeske(sporocilo);
  }
  //------------------------------------------------------------------ naloga 2,3
 
  
  var sistemskoSporocilo;

  if (sporocilo.charAt(0) == '/') {
    sistemskoSporocilo = klepetApp.procesirajUkaz(sporocilo);
    if (sistemskoSporocilo) {
      $('#sporocila').append(divElementHtmlTekst(sistemskoSporocilo));
    }
  } else {
    sporocilo = filtrirajVulgarneBesede(sporocilo);
    klepetApp.posljiSporocilo(trenutniKanal, sporocilo);
    $('#sporocila').append(divElementEnostavniTekst(sporocilo));
    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
  }

  $('#poslji-sporocilo').val('');
}

var socket = io.connect();
var trenutniVzdevek = "", trenutniKanal = "";

var vulgarneBesede = [];
$.get('/swearWords.txt', function(podatki) {
  vulgarneBesede = podatki.split("\r\n");
});

function filtrirajVulgarneBesede(vhod) {
  for (var i in vulgarneBesede) {
    vhod = vhod.replace(new RegExp('\\b' + vulgarneBesede[i] + '\\b',
    'gi'), function() {
      var zamenjava = "";
      for (var j = 0; j < vulgarneBesede[i].length; j++) {
        zamenjava += "*";
      } return zamenjava;
    });
  }
  return vhod;
}

$(document).ready(function() {
  var klepetApp = new Klepet(socket);

  socket.on('vzdevekSpremembaOdgovor', function(rezultat) {
    var sporocilo;
    if (rezultat.uspesno) {
      trenutniVzdevek = rezultat.vzdevek;
      sporocilo = 'Prijavljen si kot ' + rezultat.vzdevek + '.';
      $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
    } else {
      sporocilo = rezultat.sporocilo;
    }
    $('#sporocila').append(divElementHtmlTekst(sporocilo));
  });

  socket.on('pridruzitevOdgovor', function(rezultat) {
    trenutniKanal = rezultat.kanal;
    $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
    $('#sporocila').append(divElementHtmlTekst('Sprememba kanala.'));
  });

  socket.on('sporocilo', function (sporocilo) {
    var novElement = divElementEnostavniTekst(sporocilo.besedilo);
    $('#sporocila').append(novElement);
  });

  socket.on('kanali', function(kanali) {
    $('#seznam-kanalov').empty();

    for(var kanal in kanali) {
      kanal = kanal.substring(1, kanal.length);
      if (kanal != '') {
        $('#seznam-kanalov').append(divElementEnostavniTekst(kanal));
      }
    }

    $('#seznam-kanalov div').click(function() {
      klepetApp.procesirajUkaz('/pridruzitev ' + $(this).text());
      $('#poslji-sporocilo').focus();
    });
  });

  socket.on('uporabniki', function(uporabniki) {
    $('#seznam-uporabnikov').empty();
    for (var i=0; i < uporabniki.length; i++) {
      $('#seznam-uporabnikov').append(divElementEnostavniTekst(uporabniki[i]));
    }
    //----------------------------------------------------------------------- naloga 1.
    $("#seznam-uporabnikov div").click(function() {
       $('#poslji-sporocilo').val('/zasebno "' + $(this).html() + '" ').focus();
    })
    //----------------------------------------------------------------------- naloga.1
  });

  setInterval(function() {
    socket.emit('kanali');
    socket.emit('uporabniki', {kanal: trenutniKanal});
  }, 1000);

  $('#poslji-sporocilo').focus();

  $('#poslji-obrazec').submit(function() {
    procesirajVnosUporabnika(klepetApp, socket);
    return false;
  });
});

// --------------------------------------------------------- naloga 2

function dodajSliko(vhodnoBesedilo) {
  var scan = "";
  var slika = vhodnoBesedilo.match(new RegExp(/https?:\/\/.*?\.(jpg|png|gif)/gi));
   
  for(var i = 0; i<slika.length; i++) {
    if(!(slika[i].indexOf("http://sandbox.lavbic.net/teaching/OIS/gradivo/") > -1)) { 
      scan += "<img src='"+ slika[i] + "' style='width:200px; margin-left:20px;' />";
    }
    
  }
  vhodnoBesedilo += scan;
  return vhodnoBesedilo;
}
//---------------------------------------------------------- naloga 2

//--------------------------------------------------------------naloga 3
function dodajVideo(vhodnoBesedilo){
  var scan = "";
  var link = vhodnoBesedilo.match(new RegExp(/(?:(?:http|https):\/\/www\.youtube\.com\/watch\?v=)(.{11})/gi));
   
  if(link != null){
    for(var i = 0; i < link.length; i++){
      var link2 = link[i].substring(link[i].indexOf('watch?v') + 8);
      scan += "<iframe src='https://www.youtube.com/embed/" + link2 + "' allowfullscreen class ='video'></iframe>";
    }
    vhodnoBesedilo +=scan;
  }
return vhodnoBesedilo;
} 
//--------------------------------------------------------------naloga 3

function dodajSmeske(vhodnoBesedilo) {
  var preslikovalnaTabela = {
    ";)": "wink.png",
    ":)": "smiley.png",
    "(y)": "like.png",
    ":*": "kiss.png",
    ":(": "sad.png"
  };
  for (var smesko in preslikovalnaTabela) {
    vhodnoBesedilo = vhodnoBesedilo.replace(smesko,
      "<img src='http://sandbox.lavbic.net/teaching/OIS/gradivo/" +
      preslikovalnaTabela[smesko] + "' />");
  }
  return vhodnoBesedilo;
}