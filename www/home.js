app = window.app || {}

const fragment = `
  <label for="files" class="btn"></label>
  <input id="files" style="display:none;" type="file" accept="image/*">
`

const preview = base64Img => `
        <img src="${base64Img}">
        <button>Cancel</button>
        <button>Ok</button>
`


;(() => {
    class HomeView {

        constructor () {
            this.$el = document.createElement('div')
            this.$el.setAttribute('id','pic-button')
            this.$el.style.textAlign = 'center'
            this.$el.innerHTML = fragment

            const $input = this.$el.querySelector('input')

            $input.onchange = (event) => {
                const imageFile = event.target.files[0]
                const fileReader = new FileReader()
                fileReader.onload = event => {
                     app.img = event.target.result
                     location.hash = '#circle'
                }
                fileReader.readAsDataURL(imageFile)
            }
        }

        // showPreview (base64file) {
        //     const e = document.createElement('div')
        //     e.setAttribute('id','preview')
        //     e.innerHTML = preview(base64file)
        //     return e
        // }

        render () {
            return this.$el
        }
    }

    app.HomeView = HomeView
})()