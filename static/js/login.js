const form = document.querySelector('form')

form.addEventListener('submit', (e) => {
  e.preventDefault()
  let formData = new FormData(form)
  let body = {}
  for (var key of formData.entries()) {
    body[key[0]] = key[1]
  }
  fetch(form.action, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(json => {
      window.location.href = json.redirect
    })
})