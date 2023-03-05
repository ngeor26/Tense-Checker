function getTense(sentence){
    sentence = sentence.trim()
    const sent = nlp(sentence).sentences()
    const past = sent.toPastTense().text()
    const present = sent.toPresentTense().text()
    const future = sent.toFutureTense().text()
    const pastSimilarity = JaroWrinker(sentence, past)
    const presentSimilarity = JaroWrinker(sentence, present)
    const futureSimilarity = JaroWrinker(sentence, future)
    // if(sentence.includes('have to')){
    //     return 'present'
    // }
    // if(sentence === past){
    //     return 'past'
    // }else if(sentence === present){
    //     return 'present'
    // }else if(sentence === future){
    //     return 'future'
    // }
    // return 'error'
    const greatest = Math.max(pastSimilarity, presentSimilarity, futureSimilarity)
    if(greatest == pastSimilarity){
        return 'past'
    }else if(greatest == futureSimilarity){
        return 'future'
    }else if(greatest == presentSimilarity){
        return 'present'
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
    console.log(findTenseErrors(textArr, tenseSelection))
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
        if(getTense(textArr[i]) != tense){
            errors.push(i)
        }
    }
    return errors
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