const form = document.querySelector('#suggestion-form')
const feedbackSelect = document.getElementById('feedback')
const container = document.querySelector('.container')

// submit suggestion
form.addEventListener('submit', event => {
    event.preventDefault()

    const formData = new FormData(form)
    const email = formData.get('email')
    const title = formData.get('subject')
    const message = formData.get('message')
    const type = feedbackSelect.options[feedbackSelect.selectedIndex].value;

    const suggestion = {
        email,
        type,
        title,
        message
    }
    fetch('http://localhost:3000', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(suggestion),
    })
        .then(response => response.json())
        .then(suggestion => {
            console.log('Success:', suggestion);
            form.style.display = "none"
            container.innerHTML += `<div class="alert alert-success" role="alert">
                                    <h4 class="alert-heading">Well done!</h4>
                                    <p>Your <span>${suggestion.type}</span> with the title <span>"${suggestion.title.replace('<', '&lt;').replace('>', '&gt;')}"</span> was successfuly sent!</p>
                                    <hr>
                                    <a href="" class="mb-0">Write a new ticket</a>
                                    </div>`
        })
        .catch((error) => {
            console.error('Error:', error);
        });
})