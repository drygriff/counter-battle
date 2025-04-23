const updateInterval = 500; // Time in ms before getting and sending updates to server
const visualInterval = 50;

let serverLeft = 0;
let serverRight = 0;

let unsentClientLeft = 0;
let unsentClientRight = 0;

let unconfirmedClientLeft = 0;
let unconfirmedClientRight = 0;

let isFetching = false;

const leftElement = document.getElementById('leftside');
const rightElement = document.getElementById('rightside');



function lerp(start, end, t) {
    return start + (t * (end - start));
}


function updateVisuals() {
    const leftValue = serverLeft + unconfirmedClientLeft;
    const rightValue = serverRight + unconfirmedClientRight
    leftElement.innerText = Math.round(leftValue);
    rightElement.innerText = Math.round(rightValue);

    const leftPercent = Math.min(Math.max((leftValue/(leftValue+rightValue)) * 100, 10), 90);

    leftElement.style.width = leftPercent + "%";
    rightElement.style.width = (100-leftPercent) + "%";
}


function leftButton() {
    unsentClientLeft ++;
    unconfirmedClientLeft ++;

    updateVisuals();
}

function rightButton() {
    unsentClientRight ++;
    unconfirmedClientRight ++;

    updateVisuals();
}


function updateValues() {
    if (isFetching) return;
    isFetching = true;

    const currentClientLeft = unsentClientLeft;
    const currentClientRight = unsentClientRight;


    unsentClientLeft = 0;
    unsentClientRight = 0;

    fetch(`/update`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({left: currentClientLeft, right: currentClientRight})})
        .then(fetchResult => fetchResult.json()) // Waits till fetch is done, then converts from json to value
        .then(data => { // Waits till json conversion is done, then sets the stuff
            //serverLeft = data.left;
            //serverRight = data.right;

            //unconfirmedClientLeft -= currentClientLeft;
            //unconfirmedClientRight -= currentClientRight;

            let frameNumber = 0;
            const maxFrames = updateInterval / visualInterval;

            const startServerLeft = serverLeft + currentClientLeft;
            const startServerRight = serverRight + currentClientRight;
            const endServerLeft = data.left;
            const endServerRight = data.right;
            
            unconfirmedClientLeft -= currentClientLeft;
            unconfirmedClientRight -= currentClientRight;

            const intervalId = setInterval(function() {
                if (frameNumber >= maxFrames) {
                    serverLeft = endServerLeft;
                    serverRight = endServerRight;

                    isFetching = false;
                    clearInterval(intervalId);
                }

                const frameFraction = frameNumber / maxFrames;
                serverLeft = lerp(startServerLeft, endServerLeft, frameFraction);
                serverRight = lerp(startServerRight, endServerRight, frameFraction);
                
                updateVisuals();
            
                frameNumber++;
            }, visualInterval);
        })
        .catch(error => {
            console.error('Error getting values:', error);
            unsentClientLeft += currentClientLeft;
            unsentClientRight += currentClientRight;

            isFetching = false;
        });
}

setInterval(updateValues, updateInterval);