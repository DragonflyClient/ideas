const IDEAS_API_HOST = "https://ideas-api.inceptioncloud.net"

const feedbackId = new URL(window.location.href).searchParams.get("id");
const cont = document.querySelector(".container");

fetch(`${IDEAS_API_HOST}/id?id=${feedbackId}`, {
    credentials: "include"
})
    .then((response) => response.json())
    .then((response) => {
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

            const minecraftName = 'jwli'

            const userInfo = document.createElement('div')
            userInfo.classList.add('user-info')

            const username = document.createElement('p')
            username.textContent = minecraftName

            const userHead = document.createElement('div')
            userHead.classList.add('user-head')
            userHead.textContent = 'by '

            const minecraftHead = document.createElement('img')
            minecraftHead.classList.add('user-head-img')
            minecraftHead.src = `https://mc-heads.net/head/${minecraftName}`

            userHead.appendChild(minecraftHead)
            userInfo.appendChild(userHead)
            userInfo.appendChild(username)

            const attachments = document.createElement("ul")
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
            const hrTop2 = document.createElement('hr')
            const hrBot = document.createElement('hr')

            details.appendChild(h2);
            details.appendChild(date);
            itemInfo.appendChild(details)
            itemInfo.appendChild(upvoteButton)
            item.appendChild(itemInfo)
            item.appendChild(hrTop)
            item.appendChild(userInfo)
            item.appendChild(message);
            item.appendChild(hrBot)
            item.appendChild(attachments)
            cont.appendChild(item)
        }
    });

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
                setTimeout(function () {
                    Swal.fire({
                        title: `Error!`,
                        text: `${result.error}`,
                        icon: 'error',
                        confirmButtonText: 'Got it'
                    })
                }, 50)
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