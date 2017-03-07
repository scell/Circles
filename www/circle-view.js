app = window.app || {};

(() => {
  const OFFSET = 10
  let safari = false
  var ua = navigator.userAgent.toLowerCase(); 
  if (ua.indexOf('safari') != -1 && ua.indexOf('chrome') == -1) { 
    safari = true
  }

  function rotate (imgBase64) {
    let canvas = document.createElement('canvas')
    let img = new Image()
    let translateValue = 0

    let p = new Promise((resolve,reject) => {

      img.onload = event => {
        
        let imageRatio = Math.max(1080/img.width, 1080/img.height)
        app.imageRatio = imageRatio

        const rotate = img.height > img.width && safari

        app.imgWidth = img.width
        app.imgHeight = img.height

        // we don't rotate landscape images
        canvas.width = app.imgWidth = img.width*imageRatio
        canvas.height = app.imgHeight = img.height*imageRatio
        
        let ctx = canvas.getContext('2d')
        
        if (rotate) {
          ctx.translate(canvas.width,0);
          ctx.rotate(90*Math.PI/180.)
        }
        
        ctx.scale(imageRatio,imageRatio)
        ctx.drawImage(img,0,0)
        document.body.removeChild(img)
        resolve(canvas.toDataURL())
      }
    })

    img.style.position = 'absolute'
    img.style.top = '-10000px'

    setTimeout(_ => {
      img.src = imgBase64;
    },200)
    
    document.body.appendChild(img)
    return p
  }

  
  let drawCircle = (width,x,y,r) => 
	`M 0,0 V ${width} h ${width} V 0 Z 
          m ${x},${y} 
          a ${r},${r} 0 0 1 ${r},${r}
            ${r},${r} 0 0 1 -${r},${r}
            ${r},${r} 0 0 1 -${r},-${r}
            ${r},${r} 0 0 1 ${r},-${r} z`


  let viewport = (imageUrl, imageHeight, imageWidth, height,width, x,y,r) => `<svg
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${width}px"
    height="${width}px"
    viewBox="0 0 ${width} ${width}"
    version="1.1"
    id="vp">
    <g
      id="layer1">
      <image
        y="0"
        x="0"
        id="image4553"
        xlink:href="${imageUrl}"
        preserveAspectRatio="xMinYMin"
        height="${imageHeight}"
        width="${imageWidth}" />
      <path
        style="fill:#000000;fill-opacity:1;stroke-width:0.36603221"
        d="M 0,0 V ${width} h ${width} V 0 Z 
            m ${x},${y} 
            a ${r},${r} 0 0 1 ${r},${r}
              ${r},${r} 0 0 1 -${r},${r}
              ${r},${r} 0 0 1 -${r},-${r}
              ${r},${r} 0 0 1 ${r},-${r} z"
        id="rect3684"/>
    </g>
  </svg>`

  class CircleView {
    
    fillView($viewport) {
      let [lastX,lastY] = [0,0]
      
      let imgHeight
      let imgWidth

      if (app.imgHeight > app.imgWidth) {
        // portrait
        imgHeight = screen.height
        imgWidth = screen.width
      } else {
        // landscape
        imgHeight = screen.width
        imgWidth = screen.height
      }
      alert(imgHeight + ' ' + imgWidth)
      $viewport.innerHTML = viewport(app.img, imgHeight, imgWidth, screen.height, screen.width, screen.width/2,OFFSET,(screen.width/2)-OFFSET)
      let $svg = $viewport.firstChild
      let $path = $svg.querySelector('path')
      let $image = $svg.querySelector('image')
      let lastScale = 0
      let bornedScale = 0
      
      const $save = document.createElement('button')
      $save.innerText = 'Save Image'
      new Hammer($save,{}).on('tap',event => {
        this.svgImage($svg)
      })
      $viewport.appendChild($save)

      this.$el = $viewport

      let hammeronsvg = new Hammer($svg,{})
      hammeronsvg.get('pan').set({direction: Hammer.DIRECTION_ALL })
      hammeronsvg.get('pinch').set({ enable: true });

      hammeronsvg.on('panmove', event => {
        requestAnimationFrame( _ => {
          $image.setAttribute('x', lastX+event.deltaX)
          $image.setAttribute('y', lastY+event.deltaY)
        })
      })

      hammeronsvg.on('panend', event => {
        [lastX,lastY] = [lastX+event.deltaX,lastY+event.deltaY]
      })

      hammeronsvg.on('pinchout', event => {
        
        requestAnimationFrame( _ => {
          bornedScale = Math.min(6,Math.abs(event.scale + lastScale))
          $image.style.transform = 'scale('+bornedScale+') translate('+event.deltaX+'px,'+event.deltaY+'px)'
        })
      })

      hammeronsvg.on('pinchin', event => {
        requestAnimationFrame( _ => {
          bornedScale = Math.max(1 ,Math.abs(lastScale-(lastScale*(1-event.scale))))
          $image.style.transform = 'scale('+bornedScale+') translate('+event.deltaX+'px,'+event.deltaY+'px)'
        })
      })

      hammeronsvg.on('pinchend', event => {
        setTimeout(function() {
          lastScale = event.scale
        }, 200);
      })
    }

    constructor() {
      let $viewport = document.createElement('div')
      this.$el = $viewport
      rotate(app.img).then( value => {
        app.img = value
        this.fillView($viewport)
      })
    }

    svgImage($svg) {

      const $svgClone = $svg.cloneNode(true)

      $svgClone.setAttribute('height',1080)
      $svgClone.setAttribute('width',1080)
      $svgClone.setAttribute('viewBox','0 0 1080 1080')

      const imageTranslationRatio = Math.max(1080/screen.width,1080/screen.height)

      const $image = $svgClone.querySelector('image')
      $image.setAttribute('height', app.imgHeight)
      $image.setAttribute('width', app.imgWidth)
      $image.setAttribute('x', $image.getAttribute('x')*imageTranslationRatio)
      $image.setAttribute('y', $image.getAttribute('y')*imageTranslationRatio)

      const correctedOffset = OFFSET * app.imageRatio
      

      const $path = $svgClone.querySelector('path')
      $path.setAttribute('d', drawCircle(1080,(1080/2),correctedOffset,((1080)/2)-correctedOffset))

      let vp =  new XMLSerializer().serializeToString( $svgClone )
      
      vp = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${vp}` 
      
      var image = new Image();
      image.height = 1080
      image.width = 1080
      image.style.position = 'absolute'
      image.style.top = '-10000px'

      document.body.appendChild(image)

      image.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
      
        var a = document.createElement('a');
        a.download = "image.jpg";
        a.href = canvas.toDataURL('image/jpeg', 0.9)
        document.body.appendChild(a);
        a.click();

        setTimeout( _ => document.body.removeChild(image), 500)
    }

    setTimeout(function() {
      image.src = 'data:image/svg+xml;base64,' + btoa(vp)
    });
  }


    render () {
      return this.$el
    }
  }
  app.CircleView = CircleView
})()



