const IDEAS_API_HOST = "https://ideas-api.playdragonfly.net"

const feedbackId = new URL(window.location.href).searchParams.get("id");
const cont = document.querySelector(".container");
const footer = document.getElementById('footer')

const loader = document.getElementById('loader')
footer.style.display = 'none'
loader.style.display = 'block'

loadView()

function loadView() {

    fetch(`${IDEAS_API_HOST}/id?id=${feedbackId}`, {
        credentials: "include"
    })
        .then((response) => response.json())
        .then((response) => {
            footer.style.display = 'block'
            loader.style.display = 'none'
            if (response.status) {
                // Id not found
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
                // display id page

                document.title = escape(`${response.title} | ${capitalizeFirstLetter(response.type)}`);

                const item = document.createElement('div')
                item.classList.add('item')
                item.id = 'item'

                const itemInfo = document.createElement('div')
                itemInfo.classList.add('item-info')

                const details = document.createElement('div')
                details.classList.add('details', 'view')

                const upvoteButton = document.createElement("a")
                upvoteButton.id = "upvotes"
                upvoteButton.classList.add('upvotes')
                upvoteButton.textContent = response.upvotesAmount || "0"
                upvoteButton.innerHTML += '<i class="fas fa-thumbs-up"></i>'

                if (response.upvoted) {
                    upvoteButton.classList.add('upvoted')
                }

                upvoteButton.setAttribute("dragonfly-feedback-id", feedbackId)
                upvoteButton.addEventListener("click", (e) => {
                    e.preventDefault()
                    upvote()
                })

                const h2 = document.createElement("h2");
                h2.appendChild(createElmt(response.title));
                h2.style.marginBottom = "8px"

                const authorInfo = document.createElement('div')
                authorInfo.classList.add('user-info')

                if (response.username) {
                    const author = document.createElement('div')
                    author.classList.add('user-head')
                    author.textContent = 'by ' + response.username

                    authorInfo.appendChild(author)
                }

                const attachments = document.createElement("ul")
                attachments.id = 'attachments'
                if (response.attachments) {
                    let index = 1
                    for (let link of response.attachments) {
                        let entry = document.createElement("li")
                        let a = document.createElement("a")
                        a.href = link
                        a.textContent = "Attachment #" + index
                        entry.appendChild(a)
                        attachments.appendChild(entry)

                        index++
                    }
                }

                const message = document.createElement("p");
                message.classList.add('ql-editor', 'non-edit')
                message.innerHTML = response.message;

                const date = document.createElement("p");
                date.innerText = moment(response.created).fromNow();
                date.classList.add('created')

                const hrTop = document.createElement('hr')
                const hrBot = document.createElement('hr')

                details.appendChild(h2);
                details.appendChild(date);
                itemInfo.appendChild(details)
                itemInfo.appendChild(upvoteButton)
                item.appendChild(itemInfo)
                item.appendChild(authorInfo)
                item.appendChild(hrTop)
                item.appendChild(message);
                if (response.attachments) {
                    item.appendChild(hrBot)
                    item.appendChild(attachments)
                }
                cont.appendChild(item)
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
    const div = document.createElement("div");
    div.innerHTML = escape(html);
    return div.childNodes[0];
}

function upvote() {
    fetch(
        `${IDEAS_API_HOST}/upvote?id=${feedbackId}`,
        {
            credentials: "include"
        }
    ).then(result => result.json())
        .then(result => {
            console.log(result)
            const upvoteButton = document.getElementById("upvotes")
            if (result.success) {
                upvoteButton.innerHTML = `${result.upvotesAmount}<i class="fas fa-thumbs-up"></i>`
                result.added ? upvoteButton.classList.add('upvoted') : upvoteButton.classList.remove('upvoted')
            } else if (result.success !== undefined) {
                if (result.error === "Unauthenticated") {
                    document.getElementById('id01').style.display = 'block'
                } else {
                    setTimeout(function () {
                        Swal.fire({
                            title: `Error!`,
                            text: `${result.error}`,
                            icon: 'error',
                            confirmButtonText: 'Got it'
                        })
                    }, 50)
                }
            } else {
                setTimeout(function () {
                    Swal.fire({
                        title: `Error!`,
                        text: `${result.status} ${result.msg}`,
                        icon: 'error',
                        confirmButtonText: 'Got it'
                    })
                }, 50)
            }
        })
}

function afterLogin(success) {
    document.getElementById('id01').style.display = 'none'
    document.getElementById('id02').style.display = 'none'
    console.log('llllview' + success)
    document.getElementById('item').innerHTML = ''
    loadView()
}