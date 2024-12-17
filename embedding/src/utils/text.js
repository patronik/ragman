import XRegExp  from 'xregexp';

const normalizeText = (text) => {
    return text.replace(
    XRegExp("[^\\p{L}\\p{N}\\s.,!?:;-]+", "gu"), 
        " "
    ).replace(
    XRegExp("(?<!\\d)[.,!?:;-]{2,}(?!\\d)", "gu"),
    " "
    ).replace(
    XRegExp("\\s{2,}", "gu"),
    " "
    ).trim();
}
  
export const splitIntoParagraphChunks = (text, overlapSentences, metadata) => {
    const paragraphs = text.split(/\n+/).filter(p => p.trim() !== '');
    let chunks = [];

    for (let i = 0; i < paragraphs.length; i++) {
        const currentChunk = [paragraphs[i]];
        // Add overlap sentences from subsequent paragraphs if possible
        if (overlapSentences > 0 && i + 1 < paragraphs.length) {
        const subsequentSentences = paragraphs[i + 1].split(/(?<=[.!?])\s+/);
        if (subsequentSentences.length >= overlapSentences) {
            currentChunk.push(...subsequentSentences.slice(0, overlapSentences));      
        }
        }    
        chunks.push(currentChunk.join('\n'));
    }

    return chunks.map((chunk, index) => ({
        content: normalizeText(chunk),
        metadata: {
            ...metadata,
            "Chunk number": index + 1,
            "Total chunks": chunks.length
        }
    })); 
}