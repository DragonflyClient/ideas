const form = document.querySelector('#suggestion-form')
const feedbackSelect = document.getElementById('feedback')
const languageSelect = document.getElementById('language')
const container = document.querySelector('.container')
const warningCont = document.getElementById('warning')
const submitBtn = document.getElementById('submit-btn')

// submit suggestion
form.addEventListener('submit', event => {
    event.preventDefault()

    const formData = new FormData(form)
    const email = formData.get('email')
    const title = formData.get('subject')
    const message = formData.get('message')
    const type = feedbackSelect.options[feedbackSelect.selectedIndex].value
    const lang = languageSelect.options[languageSelect.selectedIndex].value

    const feedback = {
        email,
        type,
        lang,
        title,
        message
    }
    fetch('http://localhost:3000', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
    })
        .then(response => {
            if (response.ok) {
                response.json()
                    .then(feedback => {
                        console.log('Success:', feedback);
                        container.style.display = "none"
                        warningCont.innerHTML = ''
                        warningCont.innerHTML += `<div class="alert alert-success mt-5" role="alert">
                                    <h4 class="alert-heading">Well done!</h4>
                                    <p>Your <span>${feedback.type}</span> with the title <span>"${feedback.title.replace('<', '&lt;').replace('>', '&gt;')}"</span> was successfully sent!</p>
                                    <hr>
                                    <a href="" class="mb-0">Write a new ticket</a>
                                    </div>`
                        setTimeout(function () {
                            container.style.display = ''
                            warningCont.innerHTML = ''
                        }, 4500)
                        form.reset()
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
                                warningCont.innerHTML = ""
                            }, 300000)
                        }
                        setTimeout(function () {
                            submitBtn.disabled = false
                        }, 30000)
                        warningCont.innerHTML = ''
                        setTimeout(function () {
                            warningCont.innerHTML += `<div class="alert alert-danger" role="alert">
                                                        ${err.msg}
                                                  </div>`
                        }, 50)
                    })
            }
        })
    event.preventDefault()
})