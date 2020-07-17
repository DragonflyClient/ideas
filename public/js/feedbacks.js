const feedbackCont = document.querySelector(".feedbacks");
const loadMoreBtn = document.getElementById("load");
const orderSelection = document.getElementById("order");
const languageSelection = document.getElementById("lang");
const loadAmount = 10;

let order = -1;
let skip = 0;
let language = "all";

feedbackCont.innerText = "Loading...";

loadMoreBtn.addEventListener("click", function () {
  loadMoreBtn.innerText = "Loading..."
  skip += loadAmount;
  fetch(
    `http://localhost:3000/feedback?limit=${loadAmount}&expand=true&skip=${skip}&order=${order}&language=${language}`
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
    order =
      orderSelection.options[orderSelection.selectedIndex].value === "latest"
        ? -1
        : 1;
    language = languageSelection.options[languageSelection.selectedIndex].value;
    listFeedback();
  }, 0);
});

orderSelection.addEventListener("change", () => {
  order =
    orderSelection.options[orderSelection.selectedIndex].value === "latest"
      ? -1
      : 1;
  reloadAll();
});

languageSelection.addEventListener("change", () => {
  language = languageSelection.options[languageSelection.selectedIndex].value;
  reloadAll();
});

function listFeedback() {
  console.log("Loading feedback list from backend...");
  fetch(
    `http://localhost:3000/feedback?limit=${loadAmount}&skip=0&order=${order}&language=${language}`
  )
    .then((response) => response.json())
    .then((feedbacks) => {
      feedbackCont.innerText = "";
      feedbacks.forEach((feedback) => createContent(feedback));
    });
}

function reloadAll() {
  console.log("Reloading all entries...");
  feedbackCont.innerText = "Loading..."
  fetch(
    `http://localhost:3000/feedback?limit=${
    loadAmount + skip
    }&skip=0&order=${order}&language=${language}`
  )
    .then((response) => response.json())
    .then((feedbacks) => {
      feedbackCont.innerText = "";
      feedbacks.forEach((feedback) => {
        createContent(feedback);
      });
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

  const heading = document.createElement("h2");

  const a = document.createElement("a");
  a.href = `view.html?id=${feedback._id}`;
  a.textContent = feedback.title;

  const type = document.createElement("p");
  type.textContent = capitalizeFirstLetter(feedback.type);

  div.appendChild(heading);
  heading.appendChild(a);
  div.appendChild(type);

  feedbackCont.appendChild(div);
}