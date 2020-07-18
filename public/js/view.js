const feedbackId = new URL(window.location.href).searchParams.get("id");
const cont = document.querySelector(".container");

function escape(msg) {
   return msg.replace("<", "&lt;").replace(">", "&gt;");
}

function capitalizeFirstLetter(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
}

function createElmt(html) {
   var div = document.createElement("div");
   div.innerHTML = escape(html);
   return div.childNodes[0];
}

fetch(`https://ideas-api.inceptioncloud.net/id?id=${feedbackId}`)
   .then((response) => response.json())
   .then((response) => {
      const result = response[0];
      if (result === undefined) {
         // Id not found
         document.title = "Not found"
         const div = document.createElement('div')
         div.classList.add('error')
         const heading = document.createElement('h1')
         heading.textContent = 'Whoops.'

         const subHeading = document.createElement('h4')
         subHeading.textContent = `A feedback with the id ${response.id} does not exist.`

         // Implement back to overview

         div.appendChild(heading)
         div.appendChild(subHeading)

         cont.appendChild(div)

      } else {
         // display id page
         document.title = escape(`${result.title} | ${capitalizeFirstLetter(result.type)}`);

         const details = document.createElement('div')
         details.classList.add('details', 'view')

         const h2 = document.createElement("h2");
         h2.appendChild(createElmt(result.title));

         const lang = document.createElement('div')
         lang.classList.add('lang')

         const flag = document.createElement('img')
         flag.src = result.lang === 'en' ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAMAAAANIilAAAAAhFBMVEUAAADvjYbwfHSKYpnt7/GKYpp4hcrr7' +
            '/HwkYnvq6WAd7Xvx8aHaqShaJDLsMOic5vykYzyj4r0Qzbs7/E/UbXvmJPybmTuxMJ7h8zBp77///+HktFvfMfb3/FLW7nz9Pu3vuNjccNsTZSrs99qeMSTndXn6fbP1O3O0+xrXKb' +
            'Nrr9rbbgEiDpcAAAAEnRSTlMAcMDgfuDAgbCgzI7Y2J6UPDtbvABhAAAAz0lEQVRIx+2TSxKCMBBEBQEB/zBgTEIUERS9//1UilUkMRW0KKy8Re/epqdnYjD8L+upiKUtwWpkF0ScI' +
            'gn2V2QCwAelSnKYZ4cjcFFWVQn3nYR5I3uQYQRcMIwZnGMJTisjRIELRoiiLEBFdqGzMVYqtn3BV8YFfdamJhe44KKpTUFevI5K3oKgvE4l+P0L8wQLU5NFC1ORQ+HC6kRC0LYtWFi' +
            'vl/y5vNqLuH1+yVmshTOwbEda2APLfqqFP+ZTBYkWwZjvvLG02E4MBkMXD5MAkJrGRHOLAAAAAElFTkSuQmCC'
            : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8BAMAAADI0sRBAAAALVBMVEUAAABTV1z/mAVEWWT/wAf/PABEWmT/wQZlVFH/nARFWmL/wgX/PQBFWmT/wQ' +
            'cERp1ZAAAADHRSTlMAz8+/v4CAgHR0YGBk1e17AAAARklEQVQ4y2MYBbQAi41xAiugdO5dnODaqDSZ0o2COIEEUDrmDE5wdFSaNtKTlHACTaB03Tuc4PmoNJnSW1xwAm+GUUADAAA0' +
            'cjjQYLRUuAAAAABJRU5ErkJggg=='

         const attachments = document.createElement("ul")
         if (result.attachments) {
            let index = 1
            for (let link of result.attachments) {
               let entry = document.createElement("li")
               let a = document.createElement("a")
               a.href = link
               a.textContent = "Attachment #" + index
               entry.appendChild(a)
               attachments.appendChild(entry)

               index++
            }
         }

         lang.appendChild(flag)

         const message = document.createElement("p");
         message.classList.add('ql-editor', 'non-edit')
         message.innerHTML = result.message;
         // message.appendChild(createElmt(result.message));

         const date = document.createElement("p");
         date.innerText = moment(result.created).fromNow();
         date.classList.add('created')

         const hrTop = document.createElement('hr')
         const hrBot = document.createElement('hr')

         details.appendChild(h2);
         details.appendChild(lang)
         cont.appendChild(details)
         cont.appendChild(date);
         cont.appendChild(hrTop)
         cont.appendChild(message);
         cont.appendChild(hrBot)
         cont.appendChild(attachments)
      }
   });
