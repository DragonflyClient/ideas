const IDEAS_API_HOST = "https://ideas-api.inceptioncloud.net"

const feedbackCont = document.querySelector(".feedbacks");
const loadMoreBtn = document.getElementById("load");
const orderSelection = document.getElementById("order");
const languageSelection = document.getElementById("lang");
const typeSelection = document.getElementById("type");
const upvotesOrderSelection = document.getElementById("upvotes-order");
const upvotesElement = document.getElementsByClassName('upvotes')

const authenticated = localStorage.getItem("dragonfly-token") !== null
const headers = authenticated ? { 'Authorization': 'Bearer ' + localStorage.getItem("dragonfly-token") } : {}
const loadAmount = 10;

let order = -1
let skip = 0
let language = "all"
let type = "all"
let upvotesOrder = "0"

feedbackCont.innerText = "Loading...";
loadMoreBtn.style.display = 'none'

window.onunload = function () { };
window.onload = () => {
    setTimeout(function () {
        // updating values after the browser cache has been applied to the selections
        order = orderSelection.options[orderSelection.selectedIndex].value === "latest" ? -1 : 1;
        language = languageSelection.options[languageSelection.selectedIndex].value;
        type = typeSelection.options[typeSelection.selectedIndex].value;
        upvotesOrder = upvotesOrderSelection.options[upvotesOrderSelection.selectedIndex].value;
        listFeedback();
    }, 0);
}

loadMoreBtn.addEventListener("click", function () {
    loadMoreBtn.innerText = "Loading..."
    skip += loadAmount;
    fetch(
        `${IDEAS_API_HOST}/overview`
        + `?limit=${loadAmount}`
        + `&skip=${skip}`
        + `&order=${order}`
        + `&language=${language}`
        + `&type=${type}`
        + `&upvotesorder=${upvotesOrder}`,
        { headers: headers }
    ).then((response) => {
        response.json().then((feedbacks) => {
            feedbacks.forEach((feedback) => {
                createContent(feedback)
                loadMoreBtn.innerText = "Load More"
            });

            upvoteHint()
        });
    });
});

orderSelection.addEventListener("change", () => {
    order = orderSelection.options[orderSelection.selectedIndex].value === "latest" ? -1 : 1;
    reloadAll();
});

languageSelection.addEventListener("change", () => {
    language = languageSelection.options[languageSelection.selectedIndex].value;
    reloadAll();
});

typeSelection.addEventListener("change", () => {
    type = typeSelection.options[typeSelection.selectedIndex].value;
    reloadAll();
});

upvotesOrderSelection.addEventListener("change", () => {
    upvotesOrder = upvotesOrderSelection.options[upvotesOrderSelection.selectedIndex].value;
    reloadAll();
});

function listFeedback() {
    console.log("Loading feedback list from backend...");
    fetch(
        `${IDEAS_API_HOST}/overview`
        + `?limit=${loadAmount}`
        + `&skip=0`
        + `&order=${order}`
        + `&language=${language}`
        + `&type=${type}`
        + `&upvotesorder=${upvotesOrder}`,
        { headers: headers }
    )
        .then((response) => response.json())
        .then((feedbacks) => {
            feedbackCont.innerText = "";
            loadMoreBtn.style.display = 'block'
            feedbacks.forEach((feedback) => createContent(feedback));

            upvoteHint()
        });
}

function reloadAll() {
    console.log("Reloading all entries...");
    fetch(
        `${IDEAS_API_HOST}/overview`
        + `?limit=${loadAmount + skip}`
        + `&skip=0`
        + `&order=${order}`
        + `&language=${language}`
        + `&type=${type}`
        + `&upvotesorder=${upvotesOrder}`,
        { headers: headers }
    )
        .then((response) => response.json())
        .then((feedbacks) => {

            // document.getElementById('total').innerText = `All: ${feedbacks[0].total}`
            if (feedbacks.length > 0 && feedbacks[0].end !== true) {
                feedbackCont.innerText = ""
                feedbacks.forEach((feedback) => {
                    createContent(feedback);
                });
                upvoteHint()
            } else {
                feedbackCont.innerText = "No items apply to the given filters!"
            }
        });
}

function upvoteHint() {
    Array.from(upvotesElement).forEach(function (element) {
        element.addEventListener('click', () => {
            if (!element.classList.contains('upvoted')) {
                element.classList.add('clicked')
                setTimeout(() => {
                    element.classList.remove('clicked')
                }, 1300)
            }
        });
    });
}

function escape(msg) {
    return msg.replace("<", "&lt;").replace(">", "&gt;");
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createContent(feedback) {
    loadMoreBtn.disabled = feedback.end;
    if (feedback.end) return;
    const upvoted = feedback.upvoted || false

    const div = document.createElement("div");
    div.classList.add('fb')

    const details = document.createElement('div')
    details.classList.add('details')
    details.classList.add('overview')
    const flag = document.createElement('img')
    flag.src = feedback.lang === 'en' ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAAhFBMVEUAAADvjYbwfHSKYpnt7/GKYpp4hcrr7' +
        '/HwkYnvq6WAd7Xvx8aHaqShaJDLsMOic5vykYzyj4r0Qzbs7/E/UbXvmJPybmTuxMJ7h8zBp77///+HktFvfMfb3/FLW7nz9Pu3vuNjccNsTZSrs99qeMSTndXn6fbP1O3O0+xrXKb' +
        'Nrr9rbbgEiDpcAAAAEnRSTlMAcMDgfuDAgbCgzI7Y2J6UPDtbvABhAAAAz0lEQVRIx+2TSxKCMBBEBQEB/zBgTEIUERS9//1UilUkMRW0KKy8Re/epqdnYjD8L+upiKUtwWpkF0ScI' +
        'gn2V2QCwAelSnKYZ4cjcFFWVQn3nYR5I3uQYQRcMIwZnGMJTisjRIELRoiiLEBFdqGzMVYqtn3BV8YFfdamJhe44KKpTUFevI5K3oKgvE4l+P0L8wQLU5NFC1ORQ+HC6kRC0LYtWFi' +
        'vl/y5vNqLuH1+yVmshTOwbEda2APLfqqFP+ZTBYkWwZjvvLG02E4MBkMXD5MAkJrGRHOLAAAAAElFTkSuQmCC'
        : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8BAMAAADI0sRBAAAALVBMVEUAAABTV1z/mAVEWWT/wAf/PABEWmT/wQZlVFH/nARFWmL/wgX/PQBFWmT/wQ' +
        'cERp1ZAAAADHRSTlMAz8+/v4CAgHR0YGBk1e17AAAARklEQVQ4y2MYBbQAi41xAiugdO5dnODaqDSZ0o2COIEEUDrmDE5wdFSaNtKTlHACTaB03Tuc4PmoNJnSW1xwAm+GUUADAAA0' +
        'cjjQYLRUuAAAAABJRU5ErkJggg=='

    const heading = document.createElement("h3");
    heading.classList.add('title-cont')

    const upvotes = document.createElement("a")
    if (upvoted) {
        upvotes.classList.add('upvoted')
    }

    upvotes.classList.add('upvotes')
    upvotes.textContent = feedback.upvotesAmount || "0"
    upvotes.innerHTML += '<i class="fas fa-thumbs-up"></i>'

    const a = document.createElement("a");
    a.href = `view.html?id=${feedback._id}`;
    a.textContent = feedback.title;
    a.classList.add('title')

    const type = document.createElement("p");
    type.textContent = capitalizeFirstLetter(feedback.type);

    div.appendChild(upvotes);
    details.appendChild(heading);
    details.appendChild(flag)
    heading.appendChild(a);
    details.appendChild(type);
    div.appendChild(details)

    feedbackCont.appendChild(div);
}