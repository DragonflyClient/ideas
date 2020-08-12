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
                console.log(response.canManage)

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

                const title = document.createElement("span");
                title.appendChild(createElmt(response.title));
                title.classList.add('item-title')
                title.style.marginBottom = "8px"

                const state = document.createElement('span');
                let stateClass = (escape(response.state || 'pending')).toLowerCase()

                if (!response.canManage) {
                    state.innerHTML = `
                    <li class="state state-dropdown state-view dropdown">
                        <a id="drgn-state-manager" href="#">
                            <div style="cursor: default;" class="drgn-information ${stateClass}" onclick="toggleDropdown(this)">
                                <span style="pointer-events: none;" id="drgn-accountname" class="dropbtn">${escape(prettifyState(response.state || 'PENDING'))}</span>
                            </div>
                        </a>
                    </li>` // Possible states_ PENDING, APPROVED, DECLINED, DEVELOPMENT, RELEASED_EAP, RELEASED
                } else {
                    state.innerHTML = `
                    <li class="state state-dropdown dropdown">
                        <div id="drgn-state-manager">
                            <div class="drgn-information ${stateClass}" onclick="toggleDropdown(this)">
                                <span style="pointer-events: none;" id="drgn-accountname" class="dropbtn">${escape(prettifyState(response.state || 'PENDING'))}</span>
                                <span style="pointer-events: none; display: inline-block;" id="drgn-accountname-icon"><i class="fas fa-angle-down"></i></span>
                            </div>
                            <div id="myDropdown" class="dropdown-content" style="/* border-radius: 20px; */">
                                <div class="dropdown-item dropdown-item-state pending-dropdown" href="#" onclick="changeState('PENDING')" data-toggle="modal" data-target="#logoutModal" style="border-radius: 5px 5px 0 0;">Pending</div>
                                <div class="dropdown-item dropdown-item-state approved-dropdown" href="#" onclick="changeState('APPROVED')" data-toggle="modal" data-target="#logoutModal">Approved</div>
                                <div class="dropdown-item dropdown-item-state declined-dropdown" href="#" onclick="changeState('DECLINED')" data-toggle="modal" data-target="#logoutModal">Declined</div>
                                <div class="dropdown-item dropdown-item-state development-dropdown" href="#" onclick="changeState('DEVELOPMENT')" data-toggle="modal" data-target="#logoutModal">In development</div>
                                <div class="dropdown-item dropdown-item-state released_eap-dropdown" href="#" onclick="changeState('RELEASED_EAP')" data-toggle="modal" data-target="#logoutModal">Released (EAP)</div>
                                <div class="dropdown-item dropdown-item-state released-dropdown" href="#" onclick="changeState('RELEASED')" data-toggle="modal" data-target="#logoutModal" style="border-radius: 0 0 5px 5px;">Released</div>
                            </div>
                        </div>
                    </li>`
                }

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

                details.appendChild(title);
                details.appendChild(state)
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
function prettifyState(state) {
    if (state == 'DEVELOPMENT') return 'IN DEVELOPMENT'
    if (state == 'RELEASED_EAP') return 'RELEASED (EAP)'

    return state
}
function changeState(state) {
    fetch(`${IDEAS_API_HOST}/state`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
            id: feedbackId,
            state: state
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json()).then(json => {
        if (json.status == 200) {
            location.reload()
        } else {
            console.error(json)
        }
    })
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

function afterLogin(success, username, account) {
    document.getElementById('id01').style.display = 'none'
    document.getElementById('id02').style.display = 'none'
    document.getElementById('item').innerHTML = ''
    loadView()
}