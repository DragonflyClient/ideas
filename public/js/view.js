const feedbackId = new URL(window.location.href).searchParams.get('id')
const cont = document.querySelector('.container')

function escape(msg) {
    return msg.replace('<', '&lt;').replace('>', '&gt;')
}

function createElmt(html) {
    var div = document.createElement('div');
    div.innerHTML = escape(html);
    return div.childNodes[0];
}

fetch(`http://localhost:3000/id?id=${feedbackId}`)
    .then(response => response.json())
    .then(response => {
        const result = response[0]

        if (result === undefined) {
            // display error here
        } else {

            document.title = escape(result.title)
            const h2 = document.createElement('h2')
            h2.appendChild(createElmt(result.title))

            const p = document.createElement('p')
            p.appendChild(createElmt(result.message))

            cont.appendChild(h2)
            cont.appendChild(p)
        }
    })