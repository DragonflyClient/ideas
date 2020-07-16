const feedbackCont = document.querySelector('.feedbacks')
const loadMoreBtn = document.getElementById('load')
const orderSelection = document.getElementById('order')
const languageSelection = document.getElementById('lang')
const loadAmount = 10

let order = -1
let skip = 0
let language = 'all'

feedbackCont.innerText = "Loading..."

loadMoreBtn.addEventListener('click', function () {
    skip += loadAmount
    fetch(`http://localhost:3000/feedback?limit=${loadAmount}&expand=true&skip=${skip}&order=${order}&language=${language}`)
        .then(response => {
            response.json()
                .then(feedbacks => {
                    feedbacks.forEach(feedback => createContent(feedback));
                })

        })

})

window.addEventListener('load', () => {
    setTimeout(function () {
        // updating values after the browser cache has been applied to the selections
        order = orderSelection.options[orderSelection.selectedIndex].value === 'latest' ? -1 : 1
        language = languageSelection.options[languageSelection.selectedIndex].value
        listFeedback()
    }, 0)
})

orderSelection.addEventListener('change', () => {
    order = orderSelection.options[orderSelection.selectedIndex].value === 'latest' ? -1 : 1
    reloadAll()
})

languageSelection.addEventListener('change', () => {
    language = languageSelection.options[languageSelection.selectedIndex].value
    reloadAll()
})

function listFeedback() {
    console.log("Loading feedback list from backend...")
    fetch(`http://localhost:3000/feedback?limit=${loadAmount}&skip=0&order=${order}&language=${language}`)
        .then(response => response.json())
        .then(feedbacks => {
            feedbackCont.innerText = ''
            feedbacks.forEach(feedback => createContent(feedback));
        })
}

function reloadAll() {
    console.log("Reloading all entries...")
    fetch(`http://localhost:3000/feedback?limit=${loadAmount + skip}&skip=0&order=${order}&language=${language}`)
        .then(response => response.json())
        .then(feedbacks => {
            feedbackCont.innerText = ''
            feedbacks.forEach(feedback => {
                createContent(feedback)
            });

        })
}

function createContent(feedback) {
    loadMoreBtn.disabled = feedback.end
    if (feedback.end) return

    const div = document.createElement('div')

    const heading = document.createElement('h2')

    const a = document.createElement('a')
    a.href = `view.html?id=${feedback._id}`
    a.textContent = feedback.title

    const type = document.createElement('p')
    type.textContent = feedback.type

    div.appendChild(heading)
    heading.appendChild(a)
    div.appendChild(type)

    feedbackCont.appendChild(div)
}