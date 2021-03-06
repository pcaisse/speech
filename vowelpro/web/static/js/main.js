document.addEventListener('DOMContentLoaded', function() {

    "use strict";
    
    Word.new();
    
    var recordElem = document.getElementById('record');
    var recordTextElem = document.getElementById('record-text');
    var recordImgElem = document.getElementById('record-img');
    var scoreElem = document.getElementById('score');
    var msgElem = document.getElementById('msg');
    var wordElem = document.getElementById('word');
    var dialectElem = document.getElementById('dialect');
    var ipaElem = document.getElementById('ipa');
    var playElem = document.getElementById('play');
    var newWordElem = document.getElementById('new-word');
    var errorElem = document.getElementById('error');
    var spinnerElem = document.getElementById('spinner');
    var audioElem = document.getElementById('audio');

    showWord();
    setAudio();
    
    SpeechRec.init(
        function success() {
            recordElem.addEventListener('click', function() {
                if (SpeechRec.isRecording()) {
                    recordElem.disabled = true;
                    spinnerElem.classList.remove('hidden');
                    SpeechRec.stop(function(blob) {
                        var vowel = Word.getVowel();
                        var dialect = dialectElem.options[dialectElem.selectedIndex].value;
                        rateVowel(blob, vowel, dialect, function(xhrEvent) {
                            var response = xhrEvent && xhrEvent.target && 
                                    xhrEvent.target.response && JSON.parse(xhrEvent.target.response);
                            if (!response) {
                                errorElem.innerHTML = 'Error retrieving response from server.';
                                return;
                            }
                            if (response.error) {
                                errorElem.innerHTML = response.error;
                            } else {
                                var score = response.score;
                                var msg;
                                if (score >= 90) {
                                    msg = 'Excellent!';
                                } else if (score >= 80) {
                                    msg = 'Very nice!';
                                } else if (score >= 75) {
                                    msg = 'Good!';
                                } else {
                                    msg = 'Good try!';
                                }
                                scoreElem.innerHTML = score;
                                msgElem.innerHTML = msg;
                            }
                            recordElem.disabled = false;
                            spinnerElem.classList.add('hidden');
                            recordTextElem.innerHTML = 'Record';
                            recordElem.style.color = 'black';
                            //SpeechRec.download(blob); 
                        }, function(error) {
                            errorElem.innerHTML = error;
                        });
                    });
                } else {
                    SpeechRec.start();
                    clearElems();
                    recordTextElem.innerHTML = 'Stop';
                    recordElem.style.color = 'red';
                }
            });
            newWordElem.addEventListener('click', function() {
                Word.new();
                showWord();
                setAudio();
            });
            playElem.addEventListener('click', function() {
                audioElem.play();
            });
        },
        function failure() {
            errorElem.innerHTML = 'Error initializing audio recording.';
        },
        function browserNotSupported() {
            errorElem.innerHTML = 'Your broswer is not supported.';
        }
    );

    function clearElems() {
        var elems = [scoreElem, msgElem, errorElem];
        elems.forEach(function(elem) {
            elem.innerHTML = '';
        });
    }

    function setAudio() {
        audioElem.src = 'static/audio/' + Word.getWord() + '.mp3';
    }

    function showWord() {
        wordElem.innerHTML = Word.getWord();
        ipaElem.innerHTML =  '/' + Word.getVowelIpa() + '/';
        clearElems();
    }
    
    function rateVowel(blob, vowel, dialect, success, failure) {
        var formData = new FormData();
        formData.append('file', blob);
        formData.append('vowel_str', vowel);
        formData.append('dialect', dialect);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/rate', true);
        xhr.addEventListener('load', success);
        xhr.addEventListener('error', failure);
        xhr.send(formData);
    }         

});
