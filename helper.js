
/**
 * chapter selector use $n for the index
 * @param {string} url 
 * @param {number} start 
 * @param {number} end 
 * @returns 
 */
function chapterInRange(url, start, end) {
    let result = {};
    for(let i = start; i <= end; i++) {
        result['Chapter ' + i] = url.replace('$n', i);
    }
    return result;
}

/**
 * captures html between 2 elements with innerText of s
 * @param {string} s 
 * @param {boolean} [fallBackToAll=false] if there is no text captured between s, dump the whole contents
 * @returns 
 */
function contentBetween(s, fallBackToAll = false) {
    return element => {
        let result = '';
        let collect = false;
        let children = element.children;
        
        for(let i = 0; i < children.length; i++) {
            const e = children[i];
            
            if(e.textContent.trim() === s) {
                collect = !collect;
                continue;
            }

            if(collect) result += e.outerHTML;
        }

        if(result === '' && fallBackToAll) return element.innerHTML;

        return result;
    }
}

/**
 * get slice of array of children of selected element, works similarly to array slice
 * @param {*} start index of starting element
 * @param {*} end index of end element, non-inclusive. Negative values indicate indices starting from end of element list.
 */
function sliceChildren(start, end) {
    return element => {
        let result = '';
        let upperBound = end;
        if(end < 0) upperBound += element.children.length;
        
        for(let i = start; i < upperBound; i++) {
            const e = element.children[i]
            result += e.outerHTML;
        }

        return result;
    }
}