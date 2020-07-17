const form = document.querySelector('#suggestion-form')
const feedbackSelect = document.getElementById('feedback')
const languageSelect = document.getElementById('language')
const container = document.querySelector('.container')
const warningCont = document.getElementById('warning')
const submitBtn = document.getElementById('submit-btn')
const attachmentsInput = document.getElementById("attachments")

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

   for (let file of attachmentsInput.files) {
      let link = await upload(file)

      if (link) {
         attachments.push(link)
      } else {
         attachmentsInput.value = ''
         warningCont.innerHTML = ''
         container.removeChild(container.childNodes[0])
         setTimeout(function () {
            const div = document.createElement('div')
            div.classList.add('alert', 'alert-danger')
            div.setAttribute('role', 'alert')
            div.textContent = "Could not upload attachment! Probably unsupported file type."
            container.insertBefore(div, container.firstChild);
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

   fetch('http://localhost:3000', {
      method: 'POST', // or 'PUT'
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
   }).then(response => {
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
               quill.container.firstChild.innerHTML = ""
               document.getElementById('alert').remove()
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
               container.removeChild(container.childNodes[0])
               setTimeout(function () {
                  const div = document.createElement('div')
                  div.classList.add('alert', 'alert-danger')
                  div.setAttribute('role', 'alert')
                  div.setAttribute('id', 'alert')
                  div.textContent = err.msg
                  container.insertBefore(div, container.firstChild);
               }, 50)
            })
      }
   })
   event.preventDefault()
})

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