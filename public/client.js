const form = document.querySelector('#myForm')

// submit suggestion
form.addEventListener('submit', event => {
    event.preventDefault()

    const formData = new FormData(form)
    const title = formData.get('title')
    const description = formData.get('description')
    const message = {
        title,
        description
    }

    fetch('http://localhost:3000/', {
        method: 'POST',
        body: JSON.stringify(message),
        headers: {
            'content-type': 'application/json'
        }
    }).then(console.log("done"))
})