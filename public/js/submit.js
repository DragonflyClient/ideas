const IDEAS_API_HOST = "https://ideas-api.playdragonfly.net"
const DRAGONFLY_BACKEND_HOST = "https://api.playdragonfly.net"

const form = document.querySelector('#suggestion-form')
const feedbackSelect = document.getElementById('feedback')
const languageSelect = document.getElementById('language')
const container = document.querySelector('.container')
const submitBtn = document.getElementById('submit-btn')

const attachmentsInput = document.getElementById("attachments")
const attachmentsLabel = document.getElementById('attachmentsLabel')
const clearAttachments = document.getElementById('clearAttachments')
const footer = document.getElementById('footer')
let selectedFiles = []

let username = null

const loader = document.getElementById('loader')

// submit suggestion
form.addEventListener('submit', async function (event) {
    event.preventDefault()

    const formData = new FormData(form)
    const email = formData.get('email')
    const title = formData.get('subject')
    const message = quill.container.firstChild.innerHTML
    const type = feedbackSelect.options[feedbackSelect.selectedIndex].value
    const lang = languageSelect.options[languageSelect.selectedIndex].value
    const attachments = []

    container.style.display = 'none'
    footer.style.display = 'none'
    loader.style.display = 'block'

    for (let file of selectedFiles) {
        let link = await upload(file)

        if (link) {
            attachments.push(link)
        } else {
            attachmentsInput.value = ''
            setTimeout(function () {
                Swal.fire({
                    title: 'Error!',
                    text: "Could not upload attachment. Probably bad file type.",
                    icon: 'error',
                    confirmButtonText: 'Got it'
                })
            }, 50)
            return
        }
    }

    const feedback = {
        email,
        type,
        lang,
        title,
        message
    }

    if (attachments.length > 0) {
        feedback.attachments = attachments
    }

    fetch(`${IDEAS_API_HOST}/submit`, {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
        credentials: "include"
    }).then(response => {
        if (response.ok) {
            response.json()
                .then(feedback => {
                    clearAttachments.click()
                    Swal.fire({
                        title: 'Good job!',
                        text: `Your post with the title "${feedback.title.replace('<', '&lt;').replace('>', '&gt;')}" was successfully sent!`,
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'View',
                        cancelButtonText: 'Submit another post'
                    }).then((choice) => {
                        if (choice.value) {
                            window.location.href = "./view?id=" + feedback.id
                        }
                    })
                    form.reset()
                    quill.container.firstChild.innerHTML = ""
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } else {
            response.json()
                .then(err => {
                    if (err.status === 429) {
                        submitBtn.disabled = true
                        setTimeout(function () {
                        }, 300000)
                    }
                    setTimeout(function () {
                        submitBtn.disabled = false
                    }, 30000)
                    setTimeout(function () {
                        Swal.fire({
                            title: 'Error!',
                            text: err.msg,
                            icon: 'error',
                            confirmButtonText: 'Got it'
                        })
                    }, 50)
                })
        }
    })
    event.preventDefault()

    container.style.display = 'block'
    footer.style.display = 'block'
    loader.style.display = 'none'
})

clearAttachments.addEventListener('click', (event) => {
    event.preventDefault()
    selectedFiles = []
    attachmentsLabel.innerText = "Upload attachments"
})

attachmentsInput.addEventListener('change', (event) => {
    const files = event.target.files
    let names = ""

    for (let file of files) {
        selectedFiles.push(file);
    }

    for (let file of selectedFiles) {
        names += file.name + ", "
    }

    if (names.length >= 2) {
        names = names.substr(0, names.length - 2)
        attachmentsLabel.innerText = names
    } else {
        attachmentsLabel.innerText = "Upload attachments"
    }
})

fetch(DRAGONFLY_BACKEND_HOST + "/cookie/auth", {
    method: 'POST',
    credentials: 'include'
}).then(res => {
    if (res.status === 200) {
        res.json().then(res => {
            if (res.success) {
                const container = document.getElementById("username-info")
                const pre = document.createElement("span")
                const post = document.createElement("span")
                const strong = document.createElement("strong")

                username = res.username;

                container.innerText = ""
                pre.innerText = "You are currently logged in as "
                strong.innerText = username
                post.innerText = ". Posts you create are marked with your name."

                container.appendChild(pre)
                container.appendChild(strong)
                container.appendChild(post)
            } else {
                loginFailed()
            }
        })
    } else {
        loginFailed()
    }
})

function loginFailed() {
    const container = document.getElementById("username-info")
    const pre = document.createElement("span")
    const post = document.createElement("span")
    const strong = document.createElement("span")

    container.innerText = ""
    pre.innerText = "Since you are currently not logged in, this post will be anonymous. "
    strong.innerText = "Login"
    strong.setAttribute("onclick", "document.getElementById('id01').style.display = 'block'")
    strong.style.color = "var(--clr-primary)"
    strong.style.cursor = "pointer"
    post.innerText = " to receive updates related to your post!"

    container.appendChild(pre)
    container.appendChild(strong)
    container.appendChild(post)
}

function upload(input) {
    const name = input.name;

    if (!name.endsWith(".png")
        && !name.endsWith(".jpg")
        && !name.endsWith(".jpeg")
        && !name.endsWith(".gif"))
        return false

    const url = "https://api.imgur.com/3/image"
    const reader = new FileReader()

    return new Promise(function (resolve, reject) {
        reader.readAsDataURL(input)
        reader.onload = () => {
            const formData = new FormData();
            formData.append("image", reader.result.split(",")[1])

            fetch(url, {
                headers: {
                    "Authorization": "Client-ID c78854cfb8f4e5d"
                },
                body: formData,
                method: "POST"
            }).then(response => response.json())
                .then(response => resolve(response.data.link))
        }
    })
}