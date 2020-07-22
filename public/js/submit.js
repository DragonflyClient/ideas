const form = document.querySelector('#suggestion-form')
const feedbackSelect = document.getElementById('feedback')
const languageSelect = document.getElementById('language')
const container = document.querySelector('.container')
const warningCont = document.getElementById('warning')
const submitBtn = document.getElementById('submit-btn')
const attachmentsInput = document.getElementById("attachments")
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
   loader.style.display = 'block'

   for (let file of attachmentsInput.files) {
      let link = await upload(file)

      if (link) {
         attachments.push(link)
      } else {
         attachmentsInput.value = ''
         warningCont.innerHTML = ''
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
               warningCont.innerHTML = ''
               Swal.fire(
                  'Good job!',
                  `Your feedback with the title "${feedback.title.replace('<', '&lt;').replace('>', '&gt;')} was successfully sent!`,
                  'success'
               )
               setTimeout(function () {
                  warningCont.innerHTML = ''
               }, 4500)
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
                     warningCont.innerHTML = ""
                  }, 300000)
               }
               setTimeout(function () {
                  submitBtn.disabled = false
               }, 30000)
               warningCont.innerHTML = ''
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
   loader.style.display = 'none'
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