function getTense(sentence){
    sentence = sentence.trim()
    const sent = nlp(sentence).sentences()
    const past = sent.toPastTense().text()
    const present = sent.toPresentTense().text()
    const future = sent.toFutureTense().text()
    if(sentence.includes('have to')){
        return 'present'
    }
    if(sentence === past){
        return 'past'
    }else if(sentence === present){
        return 'present'
    }else if(sentence === future){
        return 'future'
    }
    return 'error'
}

function removeQuotedSentences(input) {
    while(input.includes('"')){
        const extractQuote = input.match(/(?:"[^"]*"|^[^"]*$)/)[0]
        console.log(extractQuote)
        input = input.replace(extractQuote, '').replace(/\s{2,}/g, ' ')
        console.log(input)
    }
    return input;
}
  
  
