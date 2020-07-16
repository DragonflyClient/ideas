const feedbackId = new URL(window.location.href).searchParams.get("id");
const cont = document.querySelector(".container");

function escape(msg) {
  return msg.replace("<", "&lt;").replace(">", "&gt;");
}

function createElmt(html) {
  var div = document.createElement("div");
  div.innerHTML = escape(html);
  return div.childNodes[0];
}

fetch(`http://localhost:3000/id?id=${feedbackId}`)
  .then((response) => response.json())
  .then((response) => {
    const result = response[0];
    if (result === undefined) { 

      document.title = "Not found"
      const div = document.createElement('div')
      div.classList.add('error')
      const heading = document.createElement('h1')
      heading.textContent = 'Whoops.'

      const subHeading = document.createElement('h4')
      subHeading.textContent = `A feedback with the id ${response.id} does not exist.`

      // Implement back to overview
      
      div.appendChild(heading)
      div.appendChild(subHeading)

      cont.appendChild(div)
      
    } else {
      document.title = escape(result.title);
      const h2 = document.createElement("h2");
      h2.appendChild(createElmt(result.title));

      const message = document.createElement("p");
      message.appendChild(createElmt(result.message));

      const date = document.createElement("p");
      date.innerText = moment(result.created).fromNow();

      cont.appendChild(h2);
      cont.appendChild(date);
      cont.appendChild(message);
    }
  });
