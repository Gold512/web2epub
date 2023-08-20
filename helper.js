
/**
 * chapter selector use $n for the index
 * @param {string} url 
 * @param {number} start 
 * @param {number} end 
 * @returns 
 */
export function chapterInRange(url, start, end) {
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
export function contentBetween(s, fallBackToAll = false) {
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
export function sliceChildren(start, end) {
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

/**
 * Get the HTML between 2 selectors on the parent element, only works on direct children of element
 * @param {string} selector1 query selector of first element
 * @param {string} selector2 query selector of last element
 * @param {boolean} [inclusive=false] whether to include the selected elements in the result
 * @returns {string}
 */
export function contentBetweenSelectors(selector1, selector2, inclusive = false) {
    return element => {
        let result = '';
        let children = element.children;
        let collect = false;

        let element1 = element.querySelector(selector1);
        let element2 = element.querySelector(selector2);

        for(let i = 0; i < children.length; i++) {
            const e = children[i];

            if(e === element1) {
                collect = true;
                if(inclusive) result += e.outerHTML;
                continue;
            }
            
            if(e === element2) {
                collect = false;
                if(inclusive) result += e.outerHTML;
                continue;
            }

            if(collect) {
                result += e.outerHTML;
            }
        }

        return result;
    }
}