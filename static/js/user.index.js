const newAvatarFileInput = document.getElementById('newAvatarFileInput')
const profilePicture = document.getElementById('profilePicture')

newAvatarFileInput.addEventListener('change', async (e) => {
  if(!newAvatarFileInput.files || !newAvatarFileInput.files[0]) return
  
  const newAvatarFile = newAvatarFileInput.files[0];
  
  fileToText(newAvatarFile)
    .then(text => {
      console.log(text)
      fetch('/user/avatar', {
        method: "POST",
        headers: { 'Content-Type': "application/json" },
        body: JSON.stringify({
          type: newAvatarFile.type,
          data: text,
        })
      })
      profilePicture.src = `data:${newAvatarFile.type};base64,${text}`
    })
})

async function fileToText(file){
  if (!file) return ''
  const reader = new FileReader()
  const promise = new Promise((resolve) => reader.addEventListener('load', (e) => resolve(btoa(e.target?.result))))
  reader.readAsBinaryString(file)
  return promise
}