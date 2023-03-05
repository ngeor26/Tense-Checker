function getTense(sentence){
    sentence = sentence.trim()
    const sent = nlp(sentence).sentences()
    const past = sent.toPastTense().text()
    const present = sent.toPresentTense().text()
    const future = sent.toFutureTense().text()
    const pastSimilarity = JaroWrinker(sentence, past)
    const presentSimilarity = JaroWrinker(sentence, present)
    const futureSimilarity = JaroWrinker(sentence, future)
    const greatest = Math.max(pastSimilarity, presentSimilarity, futureSimilarity)
    console.log(sentence)
    console.log(present, presentSimilarity)
    console.log(past, pastSimilarity)
    console.log(future, futureSimilarity)
    if(displayRadioValue() == 'past'){
        if(greatest == pastSimilarity){
            return 'past'
        }else if(greatest == futureSimilarity){
            return 'future'
        }else if(greatest == presentSimilarity){
            return 'present'
        }
    }else if(displayRadioValue() == 'present'){
        if(greatest == presentSimilarity){
            return 'present'
        }else if(greatest == pastSimilarity){
            return 'past'
        }else if(greatest == futureSimilarity){
            return 'future'
        }
    }else if(displayRadioValue() == 'future'){
        if(greatest == futureSimilarity){
            return 'future'
        }else if(greatest == presentSimilarity){
            return 'present'
        }else if(greatest == pastSimilarity){
            return 'past'
        }
    }
    return 'error'
}

function removeQuotedSentences(input) {
    while(input.includes('"')){
        const extractQuote = input.match(/(?:"[^"]*"|^[^"]*$)/)[0]
        input = input.replace(extractQuote, '').replace(/\s{2,}/g, ' ')
    }
    return input;
}

function splitText(text){
    text = text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|")
    return text;
}
  
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()
    const tenseSelection = displayRadioValue()
    const text = document.querySelector("#essay").value
    const textArr = splitText(text)
    const errors = findTenseErrors(textArr, tenseSelection)
    for(error of errors){
        //console.log(error)
        //console.log(nlp(error).sentences().toPresentTense().text())
    }
    displayErrors(errors, textArr)
})

function displayRadioValue() {
    var ele = document.getElementsByName('tense');
      
    for(i = 0; i < ele.length; i++) {
        if(ele[i].checked){
            return ele[i].value;
        }
    }
}

function findTenseErrors(textArr, tense){
    const errors = []
    for(let i = 0; i < textArr.length; i++){
        if(getTense(textArr[i]) != tense && !textArr[i].includes(`“`)){
            errors.push(textArr[i])
        }
        if(textArr[i].includes(`“`)){
            for(let j = i; j < textArr.length; j++){
                if(textArr[j].includes(`”`)){
                    i = j
                }
            }
        }
    }
    return errors
}

function toTense(sentence){
    const tense = displayRadioValue()
    if(tense == 'past'){
        return nlp(sentence).sentences().toPastTense().text()
    }else if(tense == 'present'){
        return nlp(sentence).sentences().toPresentTense().text()
    }else if(tense == 'future'){
        return nlp(sentence).sentences().toFutureTense().text()
    }
}

let errorCount;
const errorMessage = document.querySelector('h3')

function displayErrors(errors, textArr){
    document.querySelector("form").style.display = 'none'
    document.querySelector('.button-3').style.visibility = 'visible'
    document.querySelector('.button-3').addEventListener('click', function(){
        location.reload()
    })
    let result = document.querySelector("#result")
    errorMessage.innerHTML =  `${errors.length} errors`
    document.querySelector('h4').innerHTML = 'Click on error to correct it or right-click on error to ignore' + '<br><br>' + 'Zoom out if tooltip suggestion is off page'
    for(let i = 0; i < textArr.length; i++){
        for(let j = 0; j < errors.length; j++){
            if(textArr[i] == errors[j]){
                const tooltip = toTense(textArr[i])
                result.innerHTML += `<span id="text${i}" class='incorrect'>${textArr[i]}</span>` + ' '
                document.querySelector(`#text${i}`).setAttribute('data-tooltip', tooltip)
                document.querySelector(`#text${i}`).style.backgroundColor = '#ff6161'
                break;
            }
            if(j == errors.length - 1){
                result.innerHTML += `<span>${textArr[i]} </span>`
            }
        }
    }
    errorCount = errors.length
    document.querySelectorAll('.incorrect').forEach(element => {
        element.addEventListener('click', correctSentence)
        element.addEventListener('contextmenu', removeCorrection)
    });
}

function correctSentence(){
    this.innerHTML = this.getAttribute('data-tooltip')
    this.style.backgroundColor = 'transparent'
    errorCount--
    errorMessage.innerHTML = `${errorCount} errors`
    this.removeAttribute('class')
    this.removeAttribute('data-tooltip')
    this.removeEventListener('click', correctSentence)
    this.removeEventListener('contextmenu', removeCorrection)
}

function removeCorrection(e){
    e.preventDefault()
    this.style.backgroundColor = 'transparent'
    errorCount--
    errorMessage.innerHTML = `${errorCount} errors`
    this.removeAttribute('class')
    this.removeAttribute('data-tooltip')
    this.removeEventListener('click', correctSentence)
    this.removeEventListener('contextmenu', removeCorrection)
}

JaroWrinker  = function (s1, s2) {
    var m = 0;

    // Exit early if either are empty.
    if ( s1.length === 0 || s2.length === 0 ) {
        return 0;
    }

    // Exit early if they're an exact match.
    if ( s1 === s2 ) {
        return 1;
    }

    var range     = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1,
        s1Matches = new Array(s1.length),
        s2Matches = new Array(s2.length);

    for ( i = 0; i < s1.length; i++ ) {
        var low  = (i >= range) ? i - range : 0,
            high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);

        for ( j = low; j <= high; j++ ) {
        if ( s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j] ) {
            ++m;
            s1Matches[i] = s2Matches[j] = true;
            break;
        }
        }
    }

    // Exit early if no matches were found.
    if ( m === 0 ) {
        return 0;
    }

    // Count the transpositions.
    var k = n_trans = 0;

    for ( i = 0; i < s1.length; i++ ) {
        if ( s1Matches[i] === true ) {
        for ( j = k; j < s2.length; j++ ) {
            if ( s2Matches[j] === true ) {
            k = j + 1;
            break;
            }
        }

        if ( s1[i] !== s2[j] ) {
            ++n_trans;
        }
        }
    }

    var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3,
        l      = 0,
        p      = 0.1;

    if ( weight > 0.7 ) {
        while ( s1[l] === s2[l] && l < 4 ) {
        ++l;
        }

        weight = weight + l * p * (1 - weight);
    }

    return weight;
}