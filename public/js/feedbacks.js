const feedbackCont = document.querySelector('.feedbacks')
const loadMoreBtn = document.getElementById('load')

feedbackCont.innerText = "Loading..."
let skip = 0

loadMoreBtn.addEventListener('click', function () {
    skip += 10
    fetch(`http://localhost:3000/feedback?limit=10&expand=true&skip=${skip}`)
        .then(response => {
            response.json()
                .then(feedbacks => {
                    feedbacks.forEach(feedback => {
                        if (feedback.end) {
                            loadMoreBtn.disabled = true
                            return
                        }
                        const div = document.createElement('div')

                        const heading = document.createElement('h2')
                        heading.textContent = feedback.title

                        const type = document.createElement('p')
                        type.textContent = feedback.type

                        const email = document.createElement('p')
                        email.textContent = feedback.email

                        const message = document.createElement('p')
                        message.textContent = feedback.message

                        const created = document.createElement('p')
                        const time = new Date(feedback.created).toUTCString()
                        created.textContent = time

                        div.appendChild(heading)
                        div.appendChild(type)
                        div.appendChild(email)
                        div.append(message)
                        div.appendChild(created)

                        feedbackCont.appendChild(div)
                    });
                })

        })

})
window.addEventListener('load', () => {
    listFeedback()
})

function listFeedback() {
    fetch(`http://localhost:3000/feedback?limit=10&skip=${skip}`)
        .then(response => response.json())
        .then(feedbacks => {
            feedbackCont.innerText = ''
            feedbacks.forEach(feedback => {
                const div = document.createElement('div')

                const heading = document.createElement('h2')
                heading.textContent = feedback.title

                const type = document.createElement('p')
                type.textContent = feedback.type

                const email = document.createElement('p')
                email.textContent = feedback.email

                const message = document.createElement('p')
                message.textContent = feedback.message

                const created = document.createElement('p')
                const time = new Date(feedback.created).toUTCString()
                created.textContent = time.toString()

                div.appendChild(heading)
                div.appendChild(type)
                div.appendChild(email)
                div.append(message)
                div.appendChild(created)

                feedbackCont.appendChild(div)
            });
        })
}