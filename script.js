document.querySelector('form').addEventListener('submit', runChecks)

async function runChecks(e){
    e.preventDefault()
    document.querySelector('body').style.cursor = 'wait'
    const tenseSelection = displayRadioValue()
    const text = document.querySelector("#essay").value
    const textArr = splitText(text)
    const errors = await findTenseErrors(textArr, tenseSelection, text)
    displayErrors(errors, textArr)
}

function displayRadioValue() {
    var ele = document.getElementsByName('tense');
      
    for(i = 0; i < ele.length; i++) {
        if(ele[i].checked){
            return ele[i].value;
        }
    }
}

function splitText(text){
    text = text.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|")
    return text;
}

const timer = ms => new Promise(res => setTimeout(res, ms))

async function findTenseErrors(textArr, tense, text){
    const errors = []
    const length = text.match(/(\w+)/g).length
    if(tense == 'present' || tense == 'past'){
        for(let i = 0; i < length; i+=1000){
            let res;
            if(i + 1000 > length){
                res = await (await fetch('https://plum-clean-gecko.cyclic.app/' + getWords(text, i, length))).json()
            }else{
                res = await (await fetch('https://plum-clean-gecko.cyclic.app/' + getWords(text, i, i+1000))).json()
            }
            const posArr = res.taggedWords
            posArr.forEach((element, index) => {
                console.log()
                const verbTense = tenseFromPOS(element.tag)
                if(verbTense != tense){
                    errors.push(element.token)
                }
            })
            if(i > 0 && i % 5000 == 0){
                await timer(1000)
            }
        }
    }else{
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
    }
    console.log(errors)
    return errors
}

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

function tenseFromPOS(POS){
    if(POS == 'VBD'){
        return 'past';
    }else if((displayRadioValue() == 'past' || displayRadioValue() == 'present') && POS == 'VBN'){
        return displayRadioValue()
    }else if(POS == 'VB' || POS == 'VBG' || POS == 'VBP' || POS == 'VBZ'){
        return 'present';
    }else{
        return displayRadioValue()
    }
}

function removeQuotedSentences(input) {
    while(input.includes('"')){
        const extractQuote = input.match(/(?:"[^"]*"|^[^"]*$)/)[0]
        input = input.replace(extractQuote, '').replace(/\s{2,}/g, ' ')
    }
    return input;
}

function getWords(str, start, limit) {
    return str.split(/\s+/).slice(start,limit).join(" ");
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
    if(displayRadioValue() == 'future'){
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
    }else{
        let counter = 0;
        for(let i = 0; i < textArr.length; i++){
            const words = textArr[i].split(" ")
            for(let k = 0; k < words.length; k++){
                if(errors.includes(words[k].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim())){
                    const tooltip = toTense(words[k])
                    counter++
                    result.innerHTML += `<span id="text${counter}" class='incorrect'>${words[k]}</span>` + ' '
                    document.querySelector(`#text${counter}`).setAttribute('data-tooltip', tooltip)
                    document.querySelector(`#text${counter}`).style.backgroundColor = '#ff6161'
                }else{
                    result.innerHTML += `<span>${words[k]} </span>`
                }
            }
        }
    }
    result.innerHTML += '<div id="fixwrapper"><button id="fixall">Resolve All Errors</button></div>'
    errorCount = errors.length
    document.querySelectorAll('.incorrect').forEach(element => {
        element.addEventListener('click', correctSentence)
        element.addEventListener('contextmenu', removeCorrection)
    });
    document.querySelector('#fixall').addEventListener('click', resolveAll)
    document.querySelector('body').style.cursor = 'auto'
}

function resolveAll(){
    document.querySelectorAll('.incorrect').forEach(element => {
        element.innerHTML = element.getAttribute('data-tooltip')
        element.style.backgroundColor = 'transparent'
        errorCount--
        errorMessage.innerHTML = `${errorCount} errors`
        element.removeAttribute('class')
        element.removeAttribute('data-tooltip')
        element.removeEventListener('click', correctSentence)
        element.removeEventListener('contextmenu', removeCorrection)
    })
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