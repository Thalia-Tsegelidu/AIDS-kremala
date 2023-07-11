var keyboards = {};
keyboards.DE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ\u00c4\u00d6\u00dc".split('');
keyboards.EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
keyboards.ES = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split('');
keyboards.FR = "AÀÂBCÇDEÈÊËÉFGHIÎÏJKLMNOŒPQRSTUÙÛÜVWXYZ'".split('');
keyboards.IT = "AÀBCDEÉÈFGHIÌJKLMNOÒPQRSTUÙVWXYZ'".split('');
keyboards.PL = "AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ".split('');
keyboards.TR = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split('');
keyboards.RU = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split('');
keyboards.HU = "AÁBCDEÉFGHIÍJKLMNOÓÖŐPQRSTUÚÜŰVWXYZ".split('');
keyboards.GR = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ".split('');
keyboards.CZ = "ABCČDĎEFGHIJKLMNŇOPQRŘSŠTŤUVWXYZŽÁÉÍÓŮÚÝ".split('');
keyboards.UK = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ".split('');
keyboards.PT = "AÁÀÃBCÇDEÉÊFGHIÍJKLMNOÓÔPQRSTUÚVWXYZ".split('');

for(k in keyboards){
  var lang = k.toLowerCase();
  keyboards[lang] = keyboards[k].slice();
  for(var i=0; i < keyboards[lang].length; i++)
    keyboards[lang][i] = keyboards[lang][i].toLowerCase();  
}

var searchWords = null;
var currentSearchWordCounter = 0;
var currentGallowsImgCounter = 1;

var WHITE_SPACE = ' ';
var MAX_WRONG_LETTERS_PER_SEARCHWORD = 11;
/////////////////////////////////////////////////////////////////////////////
AppClient.onInit = function () {
 preloadImages();
 cacheDOMElements();
 searchWords = createQuestionModel();
 createKeyboard();
 addNextRoundBtnEvent();
  
 nextSearchWord();
};
/////////////////////////////////////////////////////////////////////////////
function cacheDOMElements () {
 $content = $('#content');
 $hintContainer = $('#hint');
 $hint = $('#hint-media');
 $keyboard = $('#keyboard');
 $gallows = $('#gallows');
 $lines = $('#lines');
 $nextRoundDialog = $('#nextRoundDisabler');
 $smile = $('#smile');
}
/////////////////////////////////////////////////////////////////////////////
function createQuestionModel () {
  var userQuestions = AppClient.getParameters("b#"); 
  var model = [];
  
  for (var i = 0; i < userQuestions.length; i++) {
    if (userQuestions[i].value !== "") {
      var hint = AppClient.getParameters('h'+userQuestions[i].list.index);
      
      var obj = userQuestions[i];
      obj.hint = hint;
      obj.value = obj.value.replace("\n", "").replace("\r", "");
      
      model.push(obj);
    }
  }
  
  if(AppClient.isTranslationOf("zufällige",AppClient.getParameter("order"))) {
    model = AppClient.shuffleArray(model);
  }
  return model;
}
/////////////////////////////////////////////////////////////////////////////
function createKeyboard () {
 var lang = AppClient.getParameter('lang');
 lang = lang == lang.toLowerCase() ? lang : lang.toUpperCase();
 if(lang == "TR" || lang == "tr") $keyboard.css("font-family","auto");
  for (var i = 0; i < keyboards[lang].length; i++) {
   var letter = keyboards[lang][i];
   var $key = $(
    '<div class="key" data-letter="'+letter+'">' +
     '<div class="letter">' + letter + '</div>' +
     '<img src="frame_enabled.png">' +
    '</div>'
   ); 
    
   $key.on('click',onKeyClick);
   $keyboard.append($key);
  }
  
 $keys = $('.key');
}
/////////////////////////////////////////////////////////////////////////////
function onKeyClick (e) {    
 var $element = $(e.target).parent('.key'); 
 if($element.length == 0) $element = $(e.target); 
 if ($element.data().used) return; 
  
 $element.data().used = true;
 $element.find('img').attr('src','frame_disabled.png');
  
 var selectedLetter = $element.data().letter;
 var isLetterInSearchedWord = false;
  
  $('.line').each(function (index,elem) {
   $elem = $(elem);
   if ($elem.data().letter.toString().toUpperCase() == selectedLetter.toUpperCase()) {
    $elem.html('<div class="fading-letter">' +$elem.data().letter.toString() + '</div>');
    $elem.data().visible = true;
    isLetterInSearchedWord = true;
   }
  });
  
  if (!isLetterInSearchedWord) {
   if (currentGallowsImgCounter >= MAX_WRONG_LETTERS_PER_SEARCHWORD) {
    showNextRoundDialog(); 
    $gallows.removeClass('gallow-'+currentGallowsImgCounter);
    currentGallowsImgCounter++;
    $gallows.addClass('gallow-'+currentGallowsImgCounter); 
   } else {
    $gallows.removeClass('gallow-'+currentGallowsImgCounter);
    currentGallowsImgCounter++;
    $gallows.addClass('gallow-'+currentGallowsImgCounter); 
   }
  }
  
  if (isLetterInSearchedWord) {
   checkIfRoundIsFinished(); 
  }
}
/////////////////////////////////////////////////////////////////////////////
function addNextRoundBtnEvent () {
 $nextRoundBtn = $('#nextRoundBtn');
 $nextRoundBtn.html(AppClient.getTranslation('nochmal'));
  
 $nextRoundBtn.on('click', function () {
  if (currentSearchWordCounter >= searchWords.length) {
   return quitApp(); 
  }
    
  $keys.each(function (index,elem) {
   $(elem).data().used = false;   
  });
  
  $keys.find('img').attr('src','frame_enabled.png'); 
  $gallows.removeClass('gallow-'+currentGallowsImgCounter);
  currentGallowsImgCounter = 1;
  $gallows.addClass('gallow-'+currentGallowsImgCounter); 
   
  $nextRoundDialog.fadeOut();
  nextSearchWord();
 });
}
/////////////////////////////////////////////////////////////////////////////
function checkIfRoundIsFinished () {
 var allLettersAreVisible = true;
  $('.line').each(function (index,elem) {
   if (!$(elem).data().visible) {
    allLettersAreVisible = false;
   }
  });
  
  if (allLettersAreVisible) {
   showNextRoundDialog();
  }
}
/////////////////////////////////////////////////////////////////////////////
function showNextRoundDialog () {  
 var smileImg = 'happy.png';
  
 $('.line').each(function (index,elem) {
  if (!$(elem).data().visible) {
   $(elem).html('<div class="fading-letter red">' + $(elem).data().letter + '</div>'); 
   smileImg = 'sad.png';
  }
 });
  
 $smile.attr('src',smileImg);
 $nextRoundDialog.fadeIn();
}
/////////////////////////////////////////////////////////////////////////////
function nextSearchWord () { 
 var searchWord = searchWords[currentSearchWordCounter];
  
 createHint(searchWord.hint);
 createLines(searchWord.value);
  
 currentSearchWordCounter++;
}
/////////////////////////////////////////////////////////////////////////////
function createLines (searchWord) {
  $lines.html("");
  
  var lang = AppClient.getParameter('lang').toUpperCase();
  var singleChars = searchWord.split('');
  
  for (var i = 0; i < singleChars.length; i++) {
   var l = singleChars[i] == WHITE_SPACE ? 'white-space' : 'line';
   var $line = null;
    // if char is not in alphabet, display it and make it visible, so the checksolution ignores this char
   if (keyboards[lang].indexOf(singleChars[i].toUpperCase()) == -1) {
    $line = $(
     '<div class="'+l+'" data-letter="'+singleChars[i]+'" data-visible="1">'+
      '<div class="fading-letter">'+singleChars[i]+'</div>' +
     '</div>');
   }
   else
    $line = $('<div class="'+l+'" data-letter="'+singleChars[i]+'"></div>');
    
   $lines.append($line);
  }
}
/////////////////////////////////////////////////////////////////////////////
function createHint (hint) {
 $hintContainer.css('background-image','none');
 if (hint.media == "text") {
  $hint.html('<span unselectable="on" class="resizeText">'+AppClient.linkifyText(hint.value)+'</span>');
 }
  
 if (hint.media == "image") {
  $hint.html("");
  $hintContainer.css('background-image','url('+hint.value+')');
 }
  
 if (hint.media == "speech") {
  hint.loadPlayer("hint-media",false);
 }
  
 if (hint.media == "audio") {
  hint.loadPlayer("hint-media",false);
 }
  
}
/////////////////////////////////////////////////////////////////////////////
function preloadImages () {
  var $preloadElement = $('<div class="preloader"></div>');
  
  for (var i = 1; i < 13; i++) {
   var img = new Image();
   img.src = i+'.png';
   img.style.width = '100%';
   $preloadElement.append(img);
  }
/*  
  for (var i = 1; i < 10; i++) {
   var img = new Image();
   img.src = 'end_'+i+'.png';
   img.style.width = '100%';
   $preloadElement.append(img); 
  }
*/ 
  var lineImage = new Image();
  lineImage.src = 'line.png';
  lineImage.style.width = '100%';
  $preloadElement.append(lineImage);
  
  var letterEnabled = new Image();
  letterEnabled.src = 'frame_enabled.png';
  letterEnabled.style.width = '100%';
  $preloadElement.append(letterEnabled);
  
  var letterDisabled = new Image();
  letterDisabled.src = 'frame_disabled.png';
  letterDisabled.style.width = '100%';
  $preloadElement.append(letterDisabled);
  
  $('body').append($preloadElement);
}
/////////////////////////////////////////////////////////////////////////////
function quitApp () {
 AppClient.setSolved();   
 $content.html('<div class="end background-contain"></div>');
  
 var $end = $('.end');
 var counter = 1;
 var max = 11;
  
 var endInterval = setInterval(function () {
  if (counter == max) {
   clearInterval(endInterval);
     
   if ( $("#feedback").length === 0) {
    var f = AppClient.getParameters("feedback").value;
    if (trim(f) === "") f = AppClient.getTranslation("FeedbackValue");
    if(trim(f) !== "")
     $("body").append(
      '<div id="feedback" '+(f.length < 50 ? 'style="text-align:center"':'')+'>'+AppClient.linkifyText(f)+
      '<br><br><div style="text-align:center">'+
      '<button style="font-size:120%" onclick="$(\'#feedback\').remove()">OK</button>'+
      '</div>'
     );
   }   
  }else{
   $end.removeClass('end-'+counter);
   counter++;
   $end.addClass('end-'+counter);
  }
 },300);
}

/////////////////////////////////////////////////////////////////////////////
function resizeText () {
  $(".line,.key").each(function(){ 
   // resize card font size: 
   var resizeText = $('.resizeText', $(this));
   if(resizeText.length > 0){
     var fontSize = 1.8;
     resizeText.css('font-size', fontSize+"em");
     resizeText.css('line-height', "normal");
     var maxWidth = $(this).width();
     var maxHeight = $(this).height();
     var textHeight;
     var textWidth;
     fontSize = 1.6;
     do {
        resizeText.css('font-size', fontSize+"em");
        textWidth = resizeText.width();
        textHeight = resizeText.height();
        fontSize = fontSize - 0.1;
     } while ((textHeight > maxHeight || textWidth > maxWidth) && fontSize > 0.3);
   }
  });  
}







