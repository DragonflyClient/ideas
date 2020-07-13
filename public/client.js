const form = document.querySelector('#suggestion-form')
const areaSelection = document.getElementById('area')

// submit suggestion
form.addEventListener('submit', event => {
    event.preventDefault()

    const formData = new FormData(form)
    const title = formData.get('subject')
    const message = formData.get('message')
    const area = areaSelection.options[areaSelection.selectedIndex].value;

    const suggestion = {
        title,
        message,
        area
    }

    fetch('http://localhost:3000/', {
        method: 'POST',
        body: JSON.stringify(suggestion),
        headers: {
            'content-type': 'application/json'
        }
    }).then(console.log("done"))
})