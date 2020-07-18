const feedbackCont = document.querySelector(".feedbacks");
const loadMoreBtn = document.getElementById("load");
const orderSelection = document.getElementById("order");
const languageSelection = document.getElementById("lang");
const typeSelection = document.getElementById("type");
const loadAmount = 10;

let order = -1
let skip = 0
let language = "all"
let type = "all"

feedbackCont.innerText = "Loading...";
loadMoreBtn.style.display = 'none'

loadMoreBtn.addEventListener("click", function () {
   loadMoreBtn.innerText = "Loading..."
   skip += loadAmount;
   fetch(
      `https://ideas-api.inceptioncloud.net/feedback`
      + `?limit=${loadAmount}`
      + `&skip=${skip}`
      + `&order=${order}`
      + `&language=${language}`
      + `&type=${type}`
   ).then((response) => {
      response.json().then((feedbacks) => {
         feedbacks.forEach((feedback) => {
            createContent(feedback)
            loadMoreBtn.innerText = "Load More"
         });
      });
   });
});

window.addEventListener("load", () => {
   setTimeout(function () {
      // updating values after the browser cache has been applied to the selections
      order = orderSelection.options[orderSelection.selectedIndex].value === "latest" ? -1 : 1;
      language = languageSelection.options[languageSelection.selectedIndex].value;
      listFeedback();
   }, 0);
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

function listFeedback() {
   console.log("Loading feedback list from backend...");
   fetch(
      `https://ideas-api.inceptioncloud.net/feedback`
      + `?limit=${loadAmount}`
      + `&skip=0`
      + `&order=${order}`
      + `&language=${language}`
      + `&type=${type}`
   )
      .then((response) => response.json())
      .then((feedbacks) => {
         feedbackCont.innerText = "";
         loadMoreBtn.style.display = 'block'
         // document.getElementById('total').innerText = `All: ${feedbacks[0].total}`
         feedbacks.forEach((feedback) => createContent(feedback));
      });
}

function reloadAll() {
   console.log("Reloading all entries...");
   // const loadingInfo = document.createElement('div')
   // loadingInfo.textContent = 'Reloading all entries...'
   // feedbackCont.insertBefore(loadingInfo, feedbackCont.firstChild);
   fetch(
      `https://ideas-api.inceptioncloud.net/feedback`
      + `?limit=${loadAmount + skip}`
      + `&skip=0`
      + `&order=${order}`
      + `&language=${language}`
      + `&type=${type}`
   )
      .then((response) => response.json())
      .then((feedbacks) => {
         // document.getElementById('total').innerText = `All: ${feedbacks[0].total}`
         if (feedbacks.length > 0 && feedbacks[0].end !== true) {
            feedbackCont.innerText = ""
            feedbacks.forEach((feedback) => {
               createContent(feedback);
            });
         } else {
            feedbackCont.innerText = "No items apply to the given filters!"
         }
      });
}

function escape(msg) {
   return msg.replace("<", "&lt;").replace(">", "&gt;");
}

function capitalizeFirstLetter(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
}

function createElmt(html) {
   var div = document.createElement("div");
   div.innerHTML = escape(html);
   return div.childNodes[0];
}

function createContent(feedback) {
   loadMoreBtn.disabled = feedback.end;
   if (feedback.end) return;

   const div = document.createElement("div");
   div.classList.add('fb')

   const details = document.createElement('div')
   details.classList.add('details')
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

   const a = document.createElement("a");
   a.href = `view.html?id=${feedback._id}`;
   a.textContent = feedback.title;

   const type = document.createElement("p");
   type.textContent = capitalizeFirstLetter(feedback.type);

   details.appendChild(heading);
   details.appendChild(flag)
   heading.appendChild(a);
   div.appendChild(details)
   div.appendChild(type);

   feedbackCont.appendChild(div);
}