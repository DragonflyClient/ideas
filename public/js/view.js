const feedbackId = new URL(window.location.href).searchParams.get('id')

fetch(`http://localhost:3000/id?id=${feedbackId}`)
    .then(response => response.json())
    .then(response => {
        const result = response[0]

        if (result === undefined) {
            // display error here
        } else {
            // add content here
        }
    })